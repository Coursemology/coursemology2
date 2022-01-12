import React from 'react';
import PropTypes from 'prop-types';

const BootstrapDropdown = ({
  selectedValue,
  options,
  style,
  dropdownId,
  onChange,
}) => (
  <div className="dropdown bootstrap-select form-control" style={style}>
    <button
      data-toggle="dropdown"
      className="btn dropdown-toggle btn-default"
      type="button"
      id={`dropdown-${dropdownId}`}
      aria-haspopup="true"
      aria-expanded="true"
    >
      {options.find((o) => o.value === selectedValue)?.label ?? <>&nbsp;</>}
      <span className="caret" />
    </button>
    <ul className="dropdown-menu" aria-labelledby={`dropdown-${dropdownId}`}>
      {options.map((o) => (
        <li
          key={o.value}
          className={o.value === selectedValue ? 'selected active' : ''}
        >
          <a onClick={() => onChange(o.value)}>{o.label}</a>
        </li>
      ))}
    </ul>
  </div>
);

BootstrapDropdown.propTypes = {
  selectedValue: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
      label: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
    }),
  ).isRequired,
  dropdownId: PropTypes.oneOf([PropTypes.number, PropTypes.string]).isRequired,
  onChange: PropTypes.func.isRequired, // (value) => void
  style: PropTypes.object,
};

export default BootstrapDropdown;
