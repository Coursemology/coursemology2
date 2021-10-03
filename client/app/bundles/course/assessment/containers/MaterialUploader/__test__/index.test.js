import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CourseAPI from 'api/course';
import MaterialUploader from '../index';
import MaterialList from '../MaterialList';
import Material from '../Material';

const folderId = 1;
const uploadedMaterial = {
  id: 10,
  name: 'Uploaded Material',
  updated_at: '2017-01-01T08:00:00.0000000Z',
  deleting: false,
};
const materials = [1, 2].map((id) => ({
  id,
  name: `Material ${id}`,
  updated_at: `2017-01-01T0${id}:00:00.0000000Z`,
  deleting: false,
}));

// Mock axios
const client = CourseAPI.materialFolders.getClient();
const mock = new MockAdapter(client);

beforeEach(() => {
  mock.reset();
});

describe('<MaterialList />', () => {
  it('renders the component with materials', () => {
    const materialList = shallow(
      <MaterialList materials={materials} onMaterialDelete={jest.fn()} />,
    );

    expect(materialList).toMatchSnapshot();
  });
});

describe('<Material />', () => {
  it('renders the material', () => {
    const material = shallow(
      <Material
        updatedAt={uploadedMaterial.updated_at}
        {...uploadedMaterial}
      />,
    );

    expect(material).toMatchSnapshot();
  });
});

describe('<MaterialUploader />', () => {
  it('uploads the material', async () => {
    mock
      .onPut(
        `/courses/${courseId}/materials/folders/${folderId}/upload_materials`,
      )
      .reply(200, {
        materials: [uploadedMaterial],
      });

    const materailUploder = mount(
      <ProviderWrapper>
        <MaterialUploader materials={materials} folderId={folderId} />
      </ProviderWrapper>,
    );

    expect(materailUploder.find('Material')).toHaveLength(2);

    const spyUpload = jest.spyOn(CourseAPI.materialFolders, 'upload');
    // Upload a file
    materailUploder.find('input[type="file"]').simulate('change', {
      target: {
        files: [{ name: 'Uploading file' }],
      },
    });

    await sleep(1);
    expect(spyUpload).toHaveBeenCalled();
    expect(materailUploder.find('Material')).toHaveLength(3);
  });
});
