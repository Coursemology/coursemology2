# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Material::ZipDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    # Folder hierarchy:
    #      f_a
    #   /   |   \
    # f_b  f_c  m_a
    #  |    |
    # m_b  f_d
    #       |
    #      m_d
    let(:folder_a) { create(:folder) }
    let(:folder_b) { create(:folder, parent: folder_a) }
    let(:folder_c) { create(:folder, parent: folder_a) }
    let(:folder_d) { create(:folder, parent: folder_c) }
    let(:material_a) { create(:material, folder: folder_a) }
    let(:material_b) { create(:material, folder: folder_b) }
    let(:material_d) { create(:material, folder: folder_d) }
    let(:materials) { [material_a, material_b, material_d] }
    let(:service) { Course::Material::ZipDownloadService.send(:new, folder_a, materials) }

    describe '#download_to_base_dir' do
      let(:dir) { service.instance_variable_get(:@base_dir) }
      subject { service.send(:download_to_base_dir) }

      before { subject }
      context 'when all of the materials are given' do
        it 'downloads the materials' do
          folder_b_path = "#{dir}/#{folder_b.name}"
          folder_c_path = "#{dir}/#{folder_c.name}"
          folder_d_path = "#{folder_c_path}/#{folder_d.name}"
          material_a_path = "#{dir}/#{material_a.name}"
          material_b_path = "#{folder_b_path}/#{material_b.name}"
          material_d_path = "#{folder_d_path}/#{material_d.name}"

          expect(
            FileUtils.compare_file(
              material_a_path,
              material_a.attachment.path
            )
          ).to be_truthy

          expect(
            FileUtils.compare_file(
              material_b_path,
              material_b.attachment.path
            )
          ).to be_truthy

          expect(
            FileUtils.compare_file(
              material_d_path,
              material_d.attachment.path
            )
          ).to be_truthy
        end

        it 'keeps the folder hierarchy' do
          folder_b_path = "#{dir}/#{folder_b.name}"
          folder_c_path = "#{dir}/#{folder_c.name}"
          folder_d_path = "#{folder_c_path}/#{folder_d.name}"
          expect(File.exist?(folder_b_path)).to be_truthy
          expect(File.exist?(folder_c_path)).to be_truthy
          expect(File.exist?(folder_d_path)).to be_truthy
        end
      end

      context 'when some of the materials are selected' do
        let(:service) do
          Course::Material::ZipDownloadService.send(:new, folder_a, [material_a, material_b])
        end

        it 'only downloads the selected materials' do
          # Only selected files and their parent folders should be downloaded
          folder_b_path = "#{dir}/#{folder_b.name}"
          folder_c_path = "#{dir}/#{folder_c.name}"
          expect(File.exist?(folder_b_path)).to be_truthy
          expect(File.exist?(folder_c_path)).to be_falsey

          material_a_path = "#{dir}/#{material_a.name}"
          material_b_path = "#{folder_b_path}/#{material_b.name}"
          expect(File.exist?(material_a_path)).to be_truthy
          expect(File.exist?(material_b_path)).to be_truthy
        end
      end
    end

    describe '#zip_base_dir' do
      let!(:dir) do
        service.send(:download_to_base_dir)
        service.instance_variable_get(:@base_dir)
      end
      subject { service.send(:zip_base_dir) }

      it 'zips the directory' do
        expect(subject).to be_present

        file_names = Zip::File.open(subject) { |f| f.map(&:name) }
        expect(file_names).to contain_exactly(
          "#{folder_b.name}/",
          "#{folder_c.name}/",
          material_a.name,
          "#{folder_b.name}/#{material_b.name}",
          "#{folder_c.name}/#{folder_d.name}/",
          "#{folder_c.name}/#{folder_d.name}/#{material_d.name}"
        )
      end
    end

    describe '.download_and_zip' do
      subject { Course::Material::ZipDownloadService.download_and_zip(folder_a, materials) }

      it 'downloads and zips the folder' do
        expect(File.exist?(subject)).to be_truthy
      end
    end
  end
end
