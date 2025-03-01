# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: RagWise', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_rag_wise_component_enabled) }

    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:parent_folder) { course.root_folder }

      scenario 'I can enable and disable auto answer' do
        visit course_admin_rag_wise_path(course)

        do_not_respond_radio_button = find('label', text: 'Do not automatically respond')
        do_not_respond_radio_button.click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_response_workflow).to eq('no')

        respond_radio_button = find('label', text: 'Automatically respond')
        respond_radio_button.click
        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_response_workflow).to eq('0')

        slider_thumb = find('.MuiSlider-thumb')
        target_low_trust = find('.MuiSlider-mark[data-index="1"]')
        slider_thumb.drag_to(target_low_trust)

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_response_workflow).to eq('30')

        target_high_trust = find('.MuiSlider-mark[data-index="2"]')
        slider_thumb.drag_to(target_high_trust)

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_response_workflow).to eq('70')

        target_publish = find('.MuiSlider-mark[data-index="3"]')
        slider_thumb.drag_to(target_publish)

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_response_workflow).to eq('100')

        target_draft = find('.MuiSlider-mark[data-index="0"]')
        slider_thumb.drag_to(target_draft)

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_response_workflow).to eq('0')
      end

      scenario 'I can edit character prompt and click promp templates' do
        visit course_admin_rag_wise_path(course)

        char_prompt_field = 'Character prompt (Max 200 Characters)'
        new_prompt = 'testing'
        fill_in char_prompt_field, with: new_prompt

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_character_prompt).to eq(new_prompt)

        no_roleplay_button = find('.MuiChip-label', text: 'No roleplay')
        no_roleplay_button.click

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_character_prompt).to eq('')

        deadpool_prompt = 'You must always impersonate Deadpool character in all your responses.'
        deadpool_roleplay_button = find('.MuiChip-label', text: 'Deadpool')
        deadpool_roleplay_button.click

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_character_prompt).to eq(deadpool_prompt)

        yoda_prompt = 'You must always impersonate Master Yoda character in all your responses.'
        yoda_roleplay_button = find('.MuiChip-label', text: 'Master Yoda')
        yoda_roleplay_button.click

        click_button 'Save changes'
        expect_toastify('Your changes have been saved.', dismiss: true)
        expect(course.reload.rag_wise_character_prompt).to eq(yoda_prompt)
      end

      scenario 'I can see uploaded pdfs and txt in materials tree' do
        visit course_material_folders_path(course)

        # inserting files
        txt_file = File.join(Rails.root, '/spec/fixtures/files/text.txt')
        pdf_file = File.join(Rails.root, '/spec/fixtures/files/one-page-document.pdf')
        non_pdf_text_file = File.join(Rails.root, '/spec/fixtures/files/template_file')
        find('#upload-files-button').click
        find('input[type="file"]', visible: false).attach_file([txt_file,
                                                                pdf_file,
                                                                non_pdf_text_file], make_visible: true)
        find('button#material-upload-form-upload-button').click
        wait_for_page

        visit course_admin_rag_wise_path(course)

        # check if only txt and pdf file appears on tree
        find('label', text: 'Expand all folders').click
        expect(page).to have_selector('.MuiListItemText-root span', text: 'text.txt')
        expect(page).to have_selector('.MuiListItemText-root span', text: 'one-page-document.pdf')
        expect(page).to_not have_selector('.MuiListItemText-root span', text: 'template_file')
      end

      scenario 'I can add and remove file from knowledge base' do
        allow_any_instance_of(RagWise::ChunkingService).to receive(:file_chunking).and_return(['test'])
        vector = JSON.parse(File.read(File.join(Rails.root, '/spec/features/rag_wise/vector.json')))['vector']
        allow_any_instance_of(RagWise::LlmService).to receive(:generate_embeddings_from_chunks).
          and_return([vector])

        visit course_material_folders_path(course)

        # inserting files
        pdf_file = File.join(Rails.root, '/spec/fixtures/files/two-page-document-with-text.pdf')
        pdf_file_name = 'two-page-document-with-text.pdf'
        find('#upload-files-button').click
        find('input[type="file"]', visible: false).attach_file([pdf_file], make_visible: true)
        find('button#material-upload-form-upload-button').click
        wait_for_page
        file = parent_folder.materials.first

        visit course_admin_rag_wise_path(course)

        find('label', text: 'Expand all folders').click
        expect(file.reload.workflow_state).to eq('not_chunked')

        # toggle knowledge base button
        pdf_file_switch = find('.MuiListItemText-root span', text: pdf_file_name).
                          ancestor('li').find('.MuiSwitch-root')
        pdf_file_switch.click
        expect_toastify("#{pdf_file_name} has been added to knowledge base.", dismiss: true)
        expect(file.reload.workflow_state).to eq('chunked')
        pdf_file_switch.click
        expect_toastify("#{pdf_file_name} has been removed from knowledge base.", dismiss: true)
        expect(file.reload.workflow_state).to eq('not_chunked')
      end

      scenario 'I cannot add file to knowledge base' do
        allow_any_instance_of(RagWise::ChunkingService).to receive(:file_chunking).and_return(['test'])
        allow_any_instance_of(RagWise::LlmService).to receive(:generate_embeddings_from_chunks).
          and_return(nil)
        visit course_material_folders_path(course)

        # inserting files
        txt_file = File.join(Rails.root, '/spec/fixtures/files/text.txt')
        txt_file_name = 'text.txt'
        find('#upload-files-button').click
        find('input[type="file"]', visible: false).attach_file([txt_file], make_visible: true)
        find('button#material-upload-form-upload-button').click
        wait_for_page

        file = parent_folder.materials.first

        visit course_admin_rag_wise_path(course)

        find('label', text: 'Expand all folders').click
        expect(file.reload.workflow_state).to eq('not_chunked')

        # toggle knowledge base button
        txt_file_switch = find('.MuiListItemText-root span', text: txt_file_name).ancestor('li').find('.MuiSwitch-root')
        txt_file_switch.click
        expect_toastify("#{txt_file_name} could not be added to knowledge base.", dismiss: true)
        expect(file.reload.workflow_state).to eq('not_chunked')
      end
    end
  end
end
