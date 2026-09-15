import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { to: '/animals', label: 'Animals' },
  { to: '/characters', label: 'Characters' },
  { to: '/cheats', label: 'Cheats' },
  { to: '/clothing', label: 'Clothing' },
  { to: '/fish', label: 'Fish' },
  { to: '/food', label: 'Food' },
  { to: '/shops', label: 'Shops' },
  { to: '/tips', label: 'Tips' },
];

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className='flex items-center justify-between p-4 border-b border-sage-meadow/30 relative z-40'>
      <NavLink to='/' className='font-display text-2xl font-bold'>
        Wyldling
      </NavLink>

      {/* Desktop nav */}
      <nav className='hidden md:flex items-center gap-6'>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className='font-body'>
            {link.label}
          </NavLink>
        ))}
        <NavLink to='/search' aria-label='Search'>
          🔍
        </NavLink>
        <ThemeToggle />
        <NavLink
          to='/settings'
          className='text-xs opacity-60 hover:opacity-100'
        >
          Settings
        </NavLink>
      </nav>

      {/* Mobile hamburger button */}
      <button
        className='md:hidden text-2xl'
        onClick={() => setIsOpen(true)}
        aria-label='Open menu'
      >
        ☰
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/40 md:hidden z-50'
          onClick={() => setIsOpen(false)}
        >
          <nav
            className='absolute right-0 top-0 h-full w-64 bg-white dark:bg-[#2b2440] shadow-2xl border-l-2 border-sage-meadow p-6 flex flex-col gap-1'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className='self-end text-2xl mb-6'
              onClick={() => setIsOpen(false)}
              aria-label='Close menu'
            >
              ✕
            </button>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className='font-body text-lg py-3 border-b border-sage-meadow/20'
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to='/search'
              className='font-body text-lg py-3 border-b border-sage-meadow/20'
              onClick={() => setIsOpen(false)}
            >
              Search
            </NavLink>
            <div className='mt-6'>
              <ThemeToggle />
            </div>
            <NavLink
              to='/settings'
              className='text-xs opacity-60 mt-4'
              onClick={() => setIsOpen(false)}
            >
              Settings
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
