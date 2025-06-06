# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Material: Folders: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:parent_folder) { course.root_folder }
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

    before { login_as(user, scope: :user, redirect_url: course_material_folders_path(course)) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can view all the subfolders' do
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

      scenario 'I can create a subfolder' do
        find('#new-subfolder-button').click

        new_folder = build(:folder, course: course)
        fill_in_react_ck 'textarea[name="description"]', new_folder.description

        find('#form-dialog-submit-button').click

        expect(page).to have_text('Failed submitting this form. Please try again.')

        find('input[name="name"]').set(new_folder.name)
        find('#form-dialog-submit-button').click

        expect(page).to have_text(new_folder.name)
        new_folder = parent_folder.children.find_by(name: new_folder.name)
        expect(page).to have_selector("#subfolder-#{new_folder.id}")
      end

      scenario 'I can edit a subfolder' do
        sample_folder = concrete_subfolders.sample
        find("#subfolder-edit-button-#{sample_folder.id}").click

        find('input[name="name"]').set(' ')
        find('#form-dialog-update-button').click
        expect(page).to have_text('Failed submitting this form. Please try again.')

        new_name = 'new name'
        find('input[name="name"]').set(new_name)
        find('#form-dialog-update-button').click

        expect(current_path).to eq(course_material_folder_path(course, parent_folder))
        within find("#subfolder-#{sample_folder.id}") do
          expect(page).to have_text(new_name)
        end
      end

      scenario 'I can delete a subfolder' do
        sample_folder = concrete_subfolders.sample

        find("#subfolder-delete-button-#{sample_folder.id}").click
        click_button('Delete')
        expect(page).not_to have_selector("#subfolder-#{sample_folder.id}")
        expect(current_path).to eq(course_material_folder_path(course, parent_folder))

        visit course_material_folder_path(course, parent_folder)
        expect(page).not_to have_selector("#subfolder-#{sample_folder.id}")
      end

      scenario 'I can upload a file to the folder' do
        file1 = File.join(Rails.root, '/spec/fixtures/files/text.txt')
        file2 = File.join(Rails.root, '/spec/fixtures/files/text2.txt')

        find('#upload-files-button').click

        # Ref: https://stackoverflow.com/questions/38049020/how-to-test-file-attachment-on-hidden-input-using-capybara
        # Wait for file input to be in the DOM (even if hidden)
        expect(page).to have_selector('input[type="file"]', visible: false)
        input = find('input[type="file"]', visible: false)

        # NOTE: Using `make_visible: true` with `attach_file` is flaky — Capybara sometimes fails with
        # a Capybara::ExpectationNotMet error even when the file input exists and is targeted correctly.
        # Instead, we use JavaScript to explicitly change the file input's CSS and make it visible.
        # This workaround ensures consistent behavior across browsers and environments.
        page.execute_script("arguments[0].style.display = 'block';", input)

        # Attach files to the (now visible) input
        input.attach_file([file1, file2])

        expect do
          find('button#material-upload-form-upload-button').click
          wait_for_page
        end.to change { parent_folder.materials.count }.by(2)
      end

      scenario 'I can download the folder' do
        expect(page).to have_selector('#download-folder-button')
      end

      scenario 'I cannot edit the folder with a owner' do
        folder_with_owner = create(:course_assessment_category, course: course).folder

        visit course_material_folder_path(course, folder_with_owner)

        expect(page).not_to have_selector('#edit-folder-button')
        expect(page).not_to have_selector('#upload-files-button')
        expect(page).not_to have_selector('#new-subfolder-button')
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Material Sidebar item' do
        expect(find_sidebar).to have_text(I18n.t('course.material.sidebar_title'))
      end

      scenario 'I can view valid subfolders' do
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

      scenario 'I can upload a file to the folder' do
        folder = create(:folder, parent: parent_folder, course: course, can_student_upload: true)
        file1 = File.join(Rails.root, '/spec/fixtures/files/text.txt')
        file2 = File.join(Rails.root, '/spec/fixtures/files/text2.txt')

        visit course_material_folder_path(course, folder)
        find('#upload-files-button').click

        # Ref: https://stackoverflow.com/questions/38049020/how-to-test-file-attachment-on-hidden-input-using-capybara
        # See scenario 'I can upload a file to the folder' under 'As a Course Manager' for detailed explanation.
        expect(page).to have_selector('input[type="file"]', visible: false)
        input = find('input[type="file"]', visible: false)
        page.execute_script("arguments[0].style.display = 'block';", input)
        input.attach_file([file1, file2])

        expect do
          find('button#material-upload-form-upload-button').click
          wait_for_page
        end.to change { folder.materials.count }.by(2)

        expect(page).to have_selector("#material-edit-button-#{folder.materials.last.id}")
        expect(page).to have_selector("#material-delete-button-#{folder.materials.last.id}")
      end
    end
  end
end
