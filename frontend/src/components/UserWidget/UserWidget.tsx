import styles from "./UserWidget.module.css"

interface UserWidgetProps {
    user: UserProfile,
    onLogoutClick: () => void
}

export function UserWidget({user, onLogoutClick}: UserWidgetProps) {
    return (
        <div className={"minecraft-card " + styles.userWidget}>
            <img className={styles.userAvatar} src={user.avatarUrl}/>
            <span className={styles.userName}>
                <span className={styles.userNameAccent}>{user.username.slice(0, 1)}</span>
                {user.username.slice(1)}
            </span>
            <button className={styles.logoutButton} onClick={onLogoutClick}>logout</button>
        </div>
    )
}