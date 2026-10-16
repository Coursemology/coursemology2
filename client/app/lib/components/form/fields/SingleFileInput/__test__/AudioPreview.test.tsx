import { render, screen, waitFor } from 'test-utils';

import AudioPreview from '../AudioPreview';

const audioSrc = (): string | null | undefined =>
  document.querySelector('audio')?.getAttribute('src');

let created: string[];
let revoked: string[];

beforeEach(() => {
  created = [];
  revoked = [];
  // jsdom implements neither.
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: (file: File) => {
      const url = `blob:${file.name}`;
      created.push(url);
      return url;
    },
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: (url: string) => revoked.push(url),
  });
});

describe('<AudioPreview />', () => {
  it('plays an uploaded file from its url', async () => {
    render(<AudioPreview url="https://example.com/saved.wav" />);

    await waitFor(() =>
      expect(audioSrc()).toBe('https://example.com/saved.wav'),
    );
  });

  it('plays a local file in preference to the uploaded one', async () => {
    render(
      <AudioPreview
        file={new File(['audio'], 'take.m4a')}
        url="https://example.com/saved.wav"
      />,
    );

    await waitFor(() => expect(audioSrc()).toBe('blob:take.m4a'));
  });

  it('renders nothing without a file or url', async () => {
    render(
      <>
        <span>mounted</span>
        <AudioPreview />
      </>,
    );

    await screen.findByText('mounted');
    expect(document.querySelector('audio')).toBeNull();
  });

  it('revokes each local file url once it is replaced or unmounted', async () => {
    const { rerender, unmount } = render(
      <AudioPreview file={new File(['one'], 'first.m4a')} />,
    );
    await waitFor(() => expect(audioSrc()).toBe('blob:first.m4a'));

    rerender(<AudioPreview file={new File(['two'], 'second.m4a')} />);
    await waitFor(() => expect(audioSrc()).toBe('blob:second.m4a'));
    expect(revoked).toEqual(['blob:first.m4a']);

    unmount();
    expect(revoked).toEqual(['blob:first.m4a', 'blob:second.m4a']);
    expect(created).toEqual(revoked);
  });
});
