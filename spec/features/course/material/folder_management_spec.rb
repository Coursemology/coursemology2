require 'rails_helper'

RSpec.feature 'Course: Material: Folders: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:parent_folder) { create(:folder, course: course) }
    let!(:subfolders) { create_list(:folder, 2, parent: parent_folder, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:administrator) }
      scenario 'I can view all the subfolders' do
        visit course_material_folder_path(course, parent_folder)
        subfolders.each do |subfolder|
          expect(page).to have_content_tag_for(subfolder)
          expect(page).to have_link(nil, href: edit_course_material_folder_path(course, subfolder))
          expect(page).to have_link(nil, href: course_material_folder_path(course, subfolder))
        end
      end

      scenario 'I can create a subfolder' do
        visit course_material_folder_path(course, parent_folder)
        find_link(nil, href: new_subfolder_course_material_folder_path(course, parent_folder)).click

        expect(current_path).to eq(new_subfolder_course_material_folder_path(course, parent_folder))

        new_folder = build(:folder, course: course)
        fill_in 'material_folder_description', with: new_folder.description
        fill_in 'material_folder_start_at', with: new_folder.start_at
        fill_in 'material_folder_end_at', with: new_folder.end_at

        click_button 'submit'

        expect(page).to have_selector('div.alert-danger')

        fill_in 'material_folder_name', with: new_folder.name
        click_button 'submit'

        expect(page).to have_content_tag_for(course.material_folders.last)
      end

      scenario 'I can edit a subfolder' do
        sample_folder = subfolders.sample
        visit course_material_folder_path(course, parent_folder)
        find_link(nil, href: edit_course_material_folder_path(course, sample_folder)).click

        fill_in 'material_folder_name', with: ''
        click_button 'submit'
        expect(page).to have_selector('div.has-error')

        new_name = 'new name'
        fill_in 'material_folder_name', with: new_name
        click_button 'submit'

        expect(current_path).to eq(course_material_folder_path(course, parent_folder))
        expect(sample_folder.reload.name).to eq(new_name)
      end

      scenario 'I can delete a subfolder' do
        visit course_material_folder_path(course, parent_folder)
        sample_folder = subfolders.sample

        expect do
          find_link(nil, href: course_material_folder_path(course, sample_folder)).click
        end.to change { parent_folder.children.count }.by(-1)
        expect(current_path).to eq(course_material_folder_path(course, parent_folder))
      end

      scenario 'I can upload a file to the folder' do
        visit course_material_folder_path(course, parent_folder)
        find_link(nil, href: new_materials_course_material_folder_path(course, parent_folder)).click
        attach_file(:material_folder_files_attributes,
                    File.join(Rails.root, '/spec/fixtures/files/text.txt'))
        expect do
          click_button 'submit'
        end.to change { parent_folder.materials.count }.by(1)
      end
    end
  end
end
