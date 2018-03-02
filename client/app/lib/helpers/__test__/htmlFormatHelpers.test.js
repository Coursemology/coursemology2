import { stripHtmlTags } from '../htmlFormatHelpers';

describe('stripHtmlTags', () => {
  it('strips the html tags accurately', () => {
    const str1 = '<p> foo <b>bar</b> baz</p> <a ref="foo.com"> Link to bar</a>';
    const str2 = 'hello <div> </div> to more <strong> tests!</strong>';

    expect(stripHtmlTags(str1)).toEqual(' foo bar baz  Link to bar');
    expect(stripHtmlTags(str2)).toEqual('hello   to more  tests!');
  });

  it('handles empty or null strings', () => {
    const str1 = null;
    const str2 = '';

    expect(stripHtmlTags(str1)).toEqual('');
    expect(stripHtmlTags(str2)).toEqual('');
  });
});
