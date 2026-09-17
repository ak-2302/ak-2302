import React from 'react';

export function ActionLink({ href, children, className = '' }) {
  return <a className={`ui-action-link ${className}`.trim()} href={href}>{children}<span aria-hidden="true">↗</span></a>;
}

export function TextButton({ children, onClick, type = 'button', className = '' }) {
  return <button className={`ui-text-button ${className}`.trim()} type={type} onClick={onClick}>{children}</button>;
}

export function BackLink({ href, children = '← ak-2302' }) {
  return <a className="ui-back-link" href={href}>{children}</a>;
}

export function SectionHeading({ eyebrow, children }) {
  return <div className="ui-section-heading"><span>{eyebrow}</span><h2>{children}</h2></div>;
}
