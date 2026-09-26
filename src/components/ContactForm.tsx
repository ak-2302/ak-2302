import { FormEvent, useState } from 'react'

type FormState = 'idle' | 'error' | 'submitting' | 'success' | 'failure'

const workerUrl = (import.meta.env.VITE_CONTACT_WORKER_URL as string | undefined) ?? 'https://contact-worker.meiteya.workers.dev'

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const body = String(data.get('message') ?? '').trim()
    const consent = data.get('consent') === 'on'

    if (!name || !email || !body || !consent || !/^\S+@\S+\.\S+$/.test(email)) {
      setState('error')
      setMessage('名前、メールアドレス、メッセージ、同意確認を入力してください。')
      return
    }

    if (!workerUrl) {
      setState('failure')
      setMessage('送信先がまだ設定されていません。メールリンクからご連絡ください。')
      return
    }

    setState('submitting')
    try {
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: body, consent }),
      })
      if (!response.ok) throw new Error('request failed')
      form.reset()
      setState('success')
      setMessage('メッセージを受け取りました。ありがとうございます。')
    } catch {
      setState('failure')
      setMessage('送信できませんでした。時間をおいてもう一度試すか、メールでご連絡ください。')
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label>
        <span>お名前</span>
        <input name="name" type="text" autoComplete="name" placeholder="あなたの名前" />
      </label>
      <label>
        <span>メールアドレス</span>
        <input name="email" type="email" autoComplete="email" placeholder="hello@example.com" />
      </label>
      <label>
        <span>メッセージ</span>
        <textarea name="message" rows={4} placeholder="相談したいこと、つくりたいものなど" />
      </label>
      <label className="consent-label">
        <input name="consent" type="checkbox" />
        <span>連絡のために入力情報を利用することに同意します。</span>
      </label>
      <button className="button button-dark" type="submit" disabled={state === 'submitting'}>
        {state === 'submitting' ? '送信中…' : 'メッセージを送る'} <span aria-hidden="true">↗</span>
      </button>
      {message && <p className={`form-message form-message-${state}`} role={state === 'error' || state === 'failure' ? 'alert' : 'status'}>{message}</p>}
    </form>
  )
}
