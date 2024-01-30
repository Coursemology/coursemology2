# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Material: Files: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:folder) { create(:folder, course: course) }
    let!(:materials) { create_list(:material, 2, folder: folder) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can view all the materials' do
        visit course_material_folder_path(course, folder)
        materials.each do |material|
          expect(page).to have_selector("#material-#{material.id}")
          expect(page).to have_selector("#material-delete-button-#{material.id}")
          expect(page).to have_selector("#material-delete-button-#{material.id}")
        end
      end

      scenario 'I can edit a file' do
        material = materials.sample
        visit course_material_folder_path(course, folder)
        find("#material-edit-button-#{material.id}").click

        new_name = ' '
        find('input[name="name"]').set(new_name)
        click_button 'Update'

        expect(material.reload.name).not_to eq(new_name)

        new_name = 'new name'
        find('input[name="name"]').set(new_name)
        click_button 'Update'

        wait_for_page

        expect(current_path).to eq(course_material_folder_path(course, folder))
        expect(material.reload.name).to eq(new_name)
      end

      scenario 'I can delete a file' do
        visit course_material_folder_path(course, folder)

        material = materials.sample

        find("#material-delete-button-#{material.id}").click
        click_button('Delete')

        expect(page).not_to have_selector("#material-#{material.id}")
        expect(current_path).to eq(course_material_folder_path(course, folder))

        visit course_material_folder_path(course, folder)
        expect(page).not_to have_selector("#material-#{material.id}")
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view all the materials' do
        visit course_material_folder_path(course, folder)

        materials.each do |material|
          expect(page).to have_selector("#material-#{material.id}")
          expect(page).not_to have_selector("#material-edit-button-#{material.id}")
          expect(page).not_to have_selector("#material-delete-button-#{material.id}")
        end
      end

      scenario 'I can edit the material created by me' do
        material = create(:material, folder: folder, creator: user)
        visit course_material_folder_path(course, folder)

        find("#material-edit-button-#{material.id}").click

        new_name = 'new name'
        find('input[name="name"]').set(new_name)
        click_button 'Update'
        wait_for_page

        expect(current_path).to eq(course_material_folder_path(course, folder))
        expect(material.reload.name).to eq(new_name)
      end
    end
  end
end
