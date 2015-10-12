require 'rails_helper'

RSpec.feature 'Course: Material: Files: Management' do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:folder) { create(:folder, course: course) }
    let!(:materials) { create_list(:material, 2, folder: folder) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:administrator) }
      scenario 'I can view all the materials' do
        visit course_material_folder_path(course, folder)
        materials.each do |material|
          expect(page).to have_content_tag_for(material)
          expect(page).
            to have_link(nil,
                         href: edit_course_material_folder_material_path(course, folder, material))
          expect(page).
            to have_link(nil, href: course_material_folder_material_path(course, folder, material))
        end
      end

      scenario 'I can edit a file' do
        material = materials.sample
        visit course_material_folder_path(course, folder)
        find_link(nil,
                  href: edit_course_material_folder_material_path(course, folder, material)).click

        fill_in 'material_name', with: ''
        click_button 'submit'
        expect(page).to have_selector('div.has-error')

        new_name = 'new name'
        fill_in 'material_name', with: new_name
        click_button 'submit'

        expect(current_path).to eq(course_material_folder_path(course, folder))
        expect(material.reload.name).to eq(new_name)
      end

      scenario 'I can delete a file' do
        visit course_material_folder_path(course, folder)

        material = materials.sample

        expect do
          find_link(nil, href: course_material_folder_material_path(course, folder, material)).click
        end.to change { folder.materials.count }.by(-1)
        expect(current_path).to eq(course_material_folder_path(course, folder))
      end
    end
  end
end
