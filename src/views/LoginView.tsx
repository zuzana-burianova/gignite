import { initiateLogin } from '../auth/spotify'
import styles from './LoginView.module.css'

export function LoginView() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Setlist</h1>
        <p className={styles.subtitle}>Concert playlist manager</p>
        <button className={styles.loginBtn} onClick={initiateLogin}>
          Connect Spotify
        </button>
      </div>
    </div>
  )
}
