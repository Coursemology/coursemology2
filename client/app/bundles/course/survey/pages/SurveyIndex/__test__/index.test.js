import React from 'react';
import { shallow } from 'enzyme';
import storeCreator from 'course/survey/store';
import SurveyIndex from '../index';

describe('<SurveyIndex />', () => {
  it('renders the index page', async () => {
    const store = storeCreator({ surveys: {} });

    const indexPage = shallow(
      <SurveyIndex params={{ courseId }} />,
      {
        context: { intl, store, muiTheme },
        childContextTypes: { muiTheme: React.PropTypes.object, intl: intlShape },
      }
    );

    expect(indexPage).toMatchSnapshot();
  });
});
