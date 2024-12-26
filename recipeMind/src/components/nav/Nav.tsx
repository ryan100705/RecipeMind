import React from 'react'
import styles from "./Nav.module.css";
import logo from "/images/Logo.png";

const Nav: React.FC<{}> = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles['logo-container']}>
                <span><img src={logo} width="250" height="75"></img></span>
            </div>
            <div className={styles['links-container']}>
                <div className={styles['link']}>
                    <a href="/home">Home</a>
                </div>
                <div className={styles['link']}>
                    <a href="/map">Map</a>
                </div>
                <div className={styles['link']}>
                    <a href="/login">Sign Out</a>
                </div>
            </div>
        </nav>
    )
}

export default Nav