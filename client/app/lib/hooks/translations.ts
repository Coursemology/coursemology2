import { defineMessages } from 'react-intl';

const translations = defineMessages({
  emptyProperties: {
    id: 'lib.hooks.emptyProperties',
    defaultMessage: 'you must define at least one property for filtering',
  },

  propsUndefined: {
    id: 'lib.hooks.propsUndefined',
    defaultMessage:
      'one of the properties described is not defined inside the referred type',
  },

  filteringButNotStringType: {
    id: 'lib.hooks.filteringButNotStringType',
    defaultMessage:
      'one of the properties, despite being described inside T, is not a string type, which is needed for filtering',
  },

  sortPropsEmpty: {
    id: 'lib.hooks.sortPropsEmpty',
    defaultMessage:
      'sortProps should have at least one element so that the method in which we want to sort is known',
  },

  sortDateButInputNotString: {
    id: 'lib.hooks.sortDateButInputNotString',
    defaultMessage:
      'if you want to sort date, you need to convert the type of the props value into string first',
  },

  dateFormatInvalid: {
    id: 'lib.hooks.dateFormatInvalid',
    defaultMessage: 'one of the date is not of valid format',
  },

  mismatchWithElemType: {
    id: 'lib.hooks.mismatchWithElemType',
    defaultMessage: 'one of the props has mismatched type with the elemType',
  },

  elemTypeNotYetSupported: {
    id: 'lib.hooks.elemTypeNotYetSupported',
    defaultMessage:
      'intended elemType is not yet supported inside this sorting method. Currently \
      only support date, number, string, and boolean',
  },

  orderNotDefinedProperly: {
    id: 'lib.hooks.orderNotDefinedProperly',
    defaultMessage:
      "one of the sortProps has order that' neither asc or desc, which is not allowed",
  },
});

export default translations;
