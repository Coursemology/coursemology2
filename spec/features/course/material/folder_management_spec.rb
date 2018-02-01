# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Material: Folders: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:parent_folder) { create(:folder, course: course) }
    let(:unpublished_started_folder) do
      folder = create(:assessment, course: course, start_at: 1.day.ago).folder
      create(:material, folder: folder)
      folder.update_column(:parent_id, parent_folder.id)
      folder
    end
    let(:published_started_folder) do
      folder = create(:assessment, :published_with_mcq_question,
                      course: course, start_at: 1.day.ago).folder
      create(:material, folder: folder)
      folder.update_column(:parent_id, parent_folder.id)
      folder
    end
    let!(:linked_subfolders) do
      [published_started_folder, unpublished_started_folder]
    end
    let!(:concrete_subfolders) do
      folders = []
      folders << create(:folder, parent: parent_folder, course: course)
      folders << create(:folder, :not_started, parent: parent_folder, course: course)
      folders << create(:folder, :ended, parent: parent_folder, course: course)
    end

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can view all the subfolders' do
        visit course_material_folder_path(course, parent_folder)
        concrete_subfolders.each do |subfolder|
          expect(page).to have_content_tag_for(subfolder)
          expect(page).to have_link(nil, href: edit_course_material_folder_path(course, subfolder))
          expect(page).to have_link(nil, href: course_material_folder_path(course, subfolder))
        end

        linked_subfolders.each do |subfolder|
          expect(page).to have_content_tag_for(subfolder)
          expect(page).
            not_to have_link(nil, href: edit_course_material_folder_path(course, subfolder))
        end

        empty_linked_folders = parent_folder.children.
                               select { |f| f.owner && f.materials.empty? && f.children.empty? }
        empty_linked_folders.each do |subfolder|
          expect(page).to have_no_content_tag_for(subfolder)
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

        expect(page).to have_content_tag_for(parent_folder.children.find_by(name: new_folder.name))
      end

      scenario 'I can edit a subfolder' do
        sample_folder = concrete_subfolders.sample
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
        sample_folder = concrete_subfolders.sample

        within find(content_tag_selector(sample_folder)) do
          expect { find(:css, 'a.delete').click }.to change { parent_folder.children.count }.by(-1)
        end

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

        wait_for_job

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
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Material Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.material.sidebar_title')
      end

      scenario 'I can view valid subfolders' do
        visible_folders = concrete_subfolders.select do |f|
          f.start_at < Time.zone.now && (f.end_at.nil? || f.end_at > Time.zone.now)
        end + [published_started_folder]

        invisible_folders = concrete_subfolders - visible_folders + [unpublished_started_folder]

        visit course_material_folder_path(course, parent_folder)

        expect(page).not_to have_selector('a.btn-danger.delete')
        visible_folders.each do |subfolder|
          expect(page).to have_content_tag_for(subfolder)
          expect(page).
            not_to have_link(nil, href: edit_course_material_folder_path(course, subfolder))
        end

        invisible_folders.each do |subfolder|
          expect(page).to have_no_content_tag_for(subfolder)
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
