/**
 * "Data & storage" — where the learner can see, and take control of, the one
 * thing this app cannot afford to lose.
 *
 * The app has no account and no backend, so persistence is a promise made by
 * the browser, and browsers break it: Safari sweeps script-writable storage
 * after seven days, "clear site data" takes everything, private windows keep
 * nothing. Rather than hide that, this panel states plainly how safe the data
 * currently is, points at the one action that makes it durable (installing the
 * app), and offers a file the learner owns outright.
 */
import { useRef, useState } from 'react';
import { localeOf } from '@ui/i18n/index.ts';
import { Button } from '@ui/components/index.ts';
import type { AppController } from '@ui/app/useAppController.ts';

type Notice = { tone: 'ok' | 'bad'; text: string } | null;

export function StorageSection({ app }: { app: AppController }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const state = app.progressState;
  const persistent = app.storage.persistent;

  async function onFile(file: File): Promise<void> {
    const text = await file.text();
    // Confirm before replacing: a restore is not a merge, and the learner may
    // have practised on this device since the backup was taken.
    if (!window.confirm(app.t('storage.importConfirm'))) return;

    const outcome = app.importBackup(text);
    if (outcome.ok) {
      setNotice({
        tone: 'ok',
        text: app.t('storage.importDone', {
          answers: app.tc('unit.answer', outcome.summary.answers),
          date: formatDate(outcome.summary.exportedAt, app.language),
        }),
      });
    } else {
      setNotice({ tone: 'bad', text: app.t(`storage.importFailed.${outcome.problem}`) });
    }
  }

  return (
    <div className="section" data-testid="storage-section">
      <h6 style={{ margin: '0 0 8px' }}>{app.t('storage.title')}</h6>

      <p className="text-muted" style={{ margin: '0 0 12px', fontSize: 11.5, lineHeight: 1.5 }}>
        {app.t('storage.intro')}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="list-row">
          <span style={{ flex: 1, fontSize: 13.5 }}>{app.t('storage.protected')}</span>
          <span
            className="text-muted"
            style={{ fontSize: 11, maxWidth: 170, textAlign: 'right' }}
            data-testid="storage-persistent"
          >
            {persistent === true
              ? app.t('storage.protectedYes')
              : persistent === false
                ? app.t('storage.protectedNo')
                : app.t('storage.protectedUnknown')}
          </span>
        </div>

        <div className="list-row">
          <span style={{ flex: 1, fontSize: 13.5 }}>{app.t('storage.backupCopy')}</span>
          <span className="text-muted" style={{ fontSize: 11, maxWidth: 170, textAlign: 'right' }}>
            {app.storage.mirrorAvailable ? app.t('storage.backupCopyOn') : app.t('storage.backupCopyOff')}
          </span>
        </div>

        <div className="list-row">
          <span style={{ flex: 1, fontSize: 13.5 }}>{app.t('storage.stored')}</span>
          <span className="text-muted" style={{ fontSize: 11 }} data-testid="storage-counts">
            {app.t('storage.storedValue', {
              answers: app.tc('unit.answer', state.attempts.length),
              days: app.tc('unit.studyDay', state.studyDays.length),
            })}
          </span>
        </div>
      </div>

      {app.storage.restored ? (
        <p className="text-muted" style={{ margin: '10px 0 0', fontSize: 11, lineHeight: 1.5 }}>
          {app.t('storage.restored')}
        </p>
      ) : null}

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button variant="secondary" block onClick={app.exportBackup} data-testid="export-backup">
            {app.t('storage.export')}
          </Button>
          <span className="text-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
            {app.t('storage.exportHint')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button variant="ghost" block framed onClick={() => fileInput.current?.click()}>
            {app.t('storage.import')}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            data-testid="import-backup"
            onChange={() => {
              const input = fileInput.current;
              const file = input?.files?.[0];
              // Reset so re-picking the same file fires `change` again.
              if (input) input.value = '';
              if (file) void onFile(file);
            }}
          />
          <span className="text-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
            {app.t('storage.importHint')}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 13.5 }}>{app.t('storage.install')}</span>
          <span className="text-muted" style={{ fontSize: 11, lineHeight: 1.5 }}>
            {app.t('storage.installHint')}
          </span>
        </div>
      </div>

      {notice ? (
        <p
          data-testid="storage-notice"
          style={{
            margin: '14px 0 0',
            fontSize: 11.5,
            lineHeight: 1.5,
            color: notice.tone === 'ok' ? 'var(--color-text)' : 'var(--color-accent)',
          }}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

function formatDate(iso: string, language: Parameters<typeof localeOf>[0]): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(localeOf(language), { dateStyle: 'medium' }).format(date);
}
