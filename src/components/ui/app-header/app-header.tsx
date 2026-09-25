import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { Link, NavLink, useLocation } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const { pathname } = useLocation();

  const isConstructorActive = pathname === '/' || pathname.startsWith('/ingredients/');

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <Link
            to="/"
            className={`${styles.link} ${isConstructorActive ? styles.link_active : ''}`}
            aria-current={isConstructorActive ? 'page' : undefined}
          >
            <BurgerIcon type={isConstructorActive ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
          </Link>

          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.link_active : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <p className="text text_type_main-default ml-2">Лента заказов</p>
              </>
            )}
          </NavLink>
        </div>

        <Link to="/" className={styles.logo} aria-label="На главную">
          <Logo className="" />
        </Link>

        <div className={styles.link_position_last}>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.link_active : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
                <p className="text text_type_main-default ml-2">
                  {userName === '' ? 'Личный кабинет' : (userName ?? 'Личный кабинет')}
                </p>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
