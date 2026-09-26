import { useCallback, useEffect, useState } from 'react'
import ToolPageShell from '../../components/tools/ToolPageShell'

type Commit = {
  sha: string
  html_url: string
  commit: { message: string; author?: { name?: string; date?: string } }
}

const DEFAULT_REPOSITORY = 'ak-2302/ak-2302'

export default function GitHubPagesHistoryPage() {
  const [repository, setRepository] = useState(DEFAULT_REPOSITORY)
  const [commits, setCommits] = useState<Commit[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const loadHistory = useCallback(async (targetRepository: string) => {
    const normalized = targetRepository.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '')
    if (!/^[^/]+\/[^/]+$/.test(normalized)) {
      setError('owner/repository の形式で入力してください。')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    try {
      const response = await fetch(`https://api.github.com/repos/${normalized}/commits?per_page=20`)
      if (!response.ok) throw new Error(response.status === 403 ? 'GitHub APIの利用制限に達しています。' : 'リポジトリを取得できませんでした。')
      setCommits(await response.json() as Commit[])
      setStatus('idle')
    } catch (loadError) {
      setStatus('error')
      setError(loadError instanceof Error ? loadError.message : '取得に失敗しました。')
    }
  }, [])

  useEffect(() => { void loadHistory(DEFAULT_REPOSITORY) }, [loadHistory])

  return (
    <ToolPageShell
      eyebrow="github pages / history"
      title={<>更新の履歴を<br /><em>観測する。</em></>}
      description="GitHub APIからリポジトリのコミット履歴を取得します。公開リポジトリの確認に使えます。"
    >
      <section className="tool-card">
        <form className="tool-inline-form" onSubmit={(event) => { event.preventDefault(); void loadHistory(repository) }}>
          <label>リポジトリ<input value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="owner/repository" /></label>
          <button className="button button-dark" type="submit" disabled={status === 'loading'}>{status === 'loading' ? '取得中…' : '読み込む ↗'}</button>
        </form>
        {error && <p className="form-message form-message-error" role="alert">{error}</p>}
        <div className="history-list" aria-live="polite">
          {commits.map((commit) => (
            <a className="history-row" href={commit.html_url} target="_blank" rel="noreferrer" key={commit.sha}>
              <span className="history-date">{commit.commit.author?.date ? new Date(commit.commit.author.date).toLocaleDateString('ja-JP') : '—'}</span>
              <strong>{commit.commit.message.split('\n')[0]}</strong>
              <span className="history-sha">{commit.sha.slice(0, 7)} ↗</span>
            </a>
          ))}
        </div>
      </section>
    </ToolPageShell>
  )
}
