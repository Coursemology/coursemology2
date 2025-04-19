import { createMockAdapter } from 'mocks/axiosMock';
import { act, fireEvent, render, RenderResult, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import FileManager from '..';

const FOLDER_ID = 1;

const MATERIALS = [
  {
    id: 1,
    name: 'Material 1',
    updated_at: '2017-01-01T01:00:00.0000000Z',
    deleting: false,
  },
  {
    id: 2,
    name: 'Material 2',
    updated_at: '2017-01-01T02:00:00.0000000Z',
    deleting: false,
  },
];

const NEW_MATERIAL = {
  id: 10,
  name: 'Material 3',
  updated_at: '2017-01-01T08:00:00.0000000Z',
  deleting: false,
};

const mock = createMockAdapter(CourseAPI.materialFolders.client);

let fileManager: RenderResult;
beforeEach(() => {
  fileManager = render(
    <FileManager folderId={FOLDER_ID} materials={MATERIALS} />,
  );
});

beforeEach(mock.reset);

describe('<FileManager />', () => {
  it('shows existing files', async () => {
    expect(await fileManager.findByText('Material 1')).toBeVisible();
    expect(fileManager.getByText('Material 2')).toBeVisible();
  });

  it('uploads a new file and shows it', async () => {
    mock
      .onPut(
        `/courses/${global.courseId}/materials/folders/${FOLDER_ID}/upload_materials`,
      )
      .reply(200, {
        materials: [NEW_MATERIAL],
      });

    const uploadApi = jest.spyOn(CourseAPI.materialFolders, 'upload');
    expect(await fileManager.findByText('Add Files')).toBeVisible();

    const fileInput = fileManager.getByTestId('FileInput');

    act(() => {
      fireEvent.change(fileInput, {
        target: { files: [{ name: NEW_MATERIAL.name }] },
      });
    });

    await waitFor(() => expect(uploadApi).toHaveBeenCalled());

    const newMaterialRow = await fileManager.findByText(NEW_MATERIAL.name);
    expect(newMaterialRow).toBeVisible();
  });
});
