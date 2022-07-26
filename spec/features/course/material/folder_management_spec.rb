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
      scenario 'I can view all the subfolders', js: true do
        visit course_material_folder_path(course, parent_folder)
        concrete_subfolders.each do |subfolder|
          expect(page).to have_selector("#subfolder-#{subfolder.id}")
          expect(page).to have_selector("#subfolder-edit-button-#{subfolder.id}")
          expect(page).to have_selector("#subfolder-delete-button-#{subfolder.id}")
        end

        linked_subfolders.each do |subfolder|
          expect(page).to have_selector("#subfolder-#{subfolder.id}")
          expect(page).not_to have_selector("#subfolder-edit-button-#{subfolder.id}")
        end

        empty_linked_folders = parent_folder.children.
                               select { |f| f.owner && f.materials.empty? && f.children.empty? }
        empty_linked_folders.each do |subfolder|
          expect(page).not_to have_selector("#subfolder-#{subfolder.id}")
        end
      end

      scenario 'I can create a subfolder', js: true do
        visit course_material_folder_path(course, parent_folder)
        find('#new-subfolder-button').click

        new_folder = build(:folder, course: course)
        fill_in_react_ck 'textarea[name="description"]', new_folder.description

        find('#folder-form-submit-button').click

        expect(page).to have_text('Failed submitting this form. Please try again.')

        find('input[name="name"]').set(new_folder.name)
        find('#folder-form-submit-button').click

        expect(page).to have_text(new_folder.name)
        new_folder = parent_folder.children.find_by(name: new_folder.name)
        expect(page).to have_selector("#subfolder-#{new_folder.id}")
      end

      scenario 'I can edit a subfolder', js: true do
        sample_folder = concrete_subfolders.sample
        visit course_material_folder_path(course, parent_folder)
        find("#subfolder-edit-button-#{sample_folder.id}").click

        find('input[name="name"]').set(' ')
        find('#folder-form-update-button').click
        expect(page).to have_text('Failed submitting this form. Please try again.')

        new_name = 'new name'
        find('input[name="name"]').set(new_name)
        find('#folder-form-update-button').click

        expect(current_path).to eq(course_material_folder_path(course, parent_folder))
        within find("#subfolder-#{sample_folder.id}") do
          expect(page).to have_text(new_name)
        end
      end

      scenario 'I can delete a subfolder', js: true do
        visit course_material_folder_path(course, parent_folder)
        sample_folder = concrete_subfolders.sample

        find("#subfolder-delete-button-#{sample_folder.id}").click
        click_button('Continue')
        expect(page).not_to have_selector("#subfolder-#{sample_folder.id}")
        expect(current_path).to eq(course_material_folder_path(course, parent_folder))

        visit course_material_folder_path(course, parent_folder)
        expect(page).not_to have_selector("#subfolder-#{sample_folder.id}")
      end

      scenario 'I can upload a file to the folder', js: true do
        visit course_material_folder_path(course, parent_folder)
        find('#upload-files-button').click
        # Only use this (without locator) if there is only 1 possible file input field
        attach_file File.join(Rails.root, '/spec/fixtures/files/text.txt')
        attach_file File.join(Rails.root, '/spec/fixtures/files/text2.txt')

        expect do
          click_button 'Upload'
          sleep(0.1)
        end.to change { parent_folder.materials.count }.by(2)
      end

      # Disabled as reponse header cannot be found
      # TODO: revisit and fix
      xscenario 'I can download the folder', js: true do
        visit course_material_folder_path(course, parent_folder)
        find('#download-folder-button').click

        wait_for_job
        expect(page.response_headers['Content-Type']).to eq('application/zip')
      end

      scenario 'I cannot edit the folder with a owner', js: true do
        folder_with_owner = create(:course_assessment_category, course: course).folder

        visit course_material_folder_path(course, folder_with_owner)

        expect(page).not_to have_selector('#edit-folder-button')
        expect(page).not_to have_selector('#upload-files-button')
        expect(page).not_to have_selector('#new-subfolder-button')
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Material Sidebar item', js: true do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.material.sidebar_title')
      end

      scenario 'I can view valid subfolders', js: true do
        visible_folders = concrete_subfolders.select do |f|
          f.start_at < Time.zone.now && (f.end_at.nil? || f.end_at > Time.zone.now)
        end + [published_started_folder]

        invisible_folders = concrete_subfolders - visible_folders + [unpublished_started_folder]

        visit course_material_folder_path(course, parent_folder)

        visible_folders.each do |subfolder|
          expect(page).to have_selector("#subfolder-#{subfolder.id}")
          expect(page).not_to have_selector("#subfolder-edit-button-#{subfolder.id}")
          expect(page).not_to have_selector("#subfolder-delete-button-#{subfolder.id}")
        end

        invisible_folders.each do |subfolder|
          expect(page).not_to have_selector("#subfolder-#{subfolder.id}")
        end
      end

      scenario 'I can upload a file to the folder', js: true do
        folder = create(:folder, parent: parent_folder, course: course, can_student_upload: true)
        visit course_material_folder_path(course, folder)
        find('#upload-files-button').click

        attach_file File.join(Rails.root, '/spec/fixtures/files/text.txt')
        attach_file File.join(Rails.root, '/spec/fixtures/files/text2.txt')
        expect do
          click_button 'Upload'
          sleep(0.1)
        end.to change { folder.materials.count }.by(2)

        expect(page).to have_selector("#material-edit-button-#{folder.materials.last.id}")
        expect(page).to have_selector("#material-delete-button-#{folder.materials.last.id}")
      end
    end
  end
end
