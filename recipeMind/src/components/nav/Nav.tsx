import React from 'react'
import styles from "./Nav.module.css";
import logo from "/images/Logo.png";
import {Link} from "react-router-dom";

const Nav: React.FC<{}> = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles['logo-container']}>
                <span><img src={logo} width="250" height="75"></img></span>
            </div>
            <div className={styles['links-container']}>
                <div className={styles['link']}>
                    <Link to="/Home">Home</Link>
                </div>
                <div className={styles['link']}>
                    <Link to="/Map">Map</Link>
                </div>
                <div className={styles['link']}>
                    <Link to="/SignIn">Sign In</Link>
                </div>
            </div>
        </nav>
    )
}

export default Nav