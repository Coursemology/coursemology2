require 'rails_helper'

RSpec.feature 'Course: Material: Folders: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:parent_folder) { course.root_folder }
    let!(:subfolders) do
      folders = []
      folders << create(:folder, parent: parent_folder, course: course)
      folders << create(:folder, :not_started, parent: parent_folder, course: course)
      folders << create(:folder, :ended, parent: parent_folder, course: course)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, :approved, course: course).user }
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

        expect(page).to have_content_tag_for(parent_folder.children.last)
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

      scenario 'I can download the folder' do
        visit course_material_folder_path(course, parent_folder)
        find_link(nil, href: download_course_material_folder_path(course, parent_folder)).click

        expect(page.response_headers['Content-Type']).to eq('application/zip')
      end

      scenario 'I cannot edit the folder with a owner' do
        folder_with_owner = create(:course_assessment_category, course: course).folder

        visit course_material_folder_path(course, folder_with_owner)

        upload_link = new_materials_course_material_folder_path(course, folder_with_owner)
        edit_link = edit_course_material_folder_path(course, folder_with_owner)
        new_subfolder_link = new_subfolder_course_material_folder_path(course, folder_with_owner)
        expect(page).not_to have_link(nil, href: edit_link)
        expect(page).not_to have_link(nil, href: new_subfolder_link)
        expect(page).not_to have_link(nil, href: upload_link)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, :approved, course: course).user }

      scenario 'I can view valid subfolders' do
        valid_folders = subfolders.select do |f|
          f.start_at < Time.zone.now && (f.end_at.nil? || f.end_at > Time.zone.now)
        end
        invalid_folders = subfolders - valid_folders
        visit course_material_folder_path(course, parent_folder)

        expect(page).not_to have_selector('a.btn-danger.delete')
        valid_folders.each do |subfolder|
          expect(page).to have_content_tag_for(subfolder)
          expect(page).
            not_to have_link(nil, href: edit_course_material_folder_path(course, subfolder))
        end

        invalid_folders.each do |subfolder|
          expect(page).not_to have_content_tag_for(subfolder)
        end
      end

      scenario 'I can upload a file to the folder' do
        folder = create(:folder, parent: parent_folder, course: course, can_student_upload: true)
        visit course_material_folder_path(course, folder)
        find_link(nil, href: new_materials_course_material_folder_path(course, folder)).click
        attach_file(:material_folder_files_attributes,
                    File.join(Rails.root, '/spec/fixtures/files/text.txt'))
        expect do
          click_button 'submit'
        end.to change { folder.materials.count }.by(1)

        edit_link = edit_course_material_folder_material_path(course, folder, folder.materials.last)
        expect(page).to have_link(nil, href: edit_link)
        expect(page).to have_selector('a.btn-danger.delete')
      end
    end
  end
end
