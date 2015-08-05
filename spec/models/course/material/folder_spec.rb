require 'rails_helper'

RSpec.describe Course::Material::Folder, type: :model do
  it { is_expected.to belong_to(:parent_folder) }
  it { is_expected.to have_many(:subfolders) }
  it { is_expected.to have_many(:materials) }
end
