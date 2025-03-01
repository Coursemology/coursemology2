# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Administration: RagWise', js: true do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_rag_wise_component_enabled) }

    before { login_as(user, scope: :user, redirect_url: course_material_folders_path(course)) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:parent_folder) { course.root_folder }

      scenario 'I can see uploaded pdfs and txt in materials tree' do
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

      scenario 'I can add and remove file from knowledge base (singular)' do
        allow_any_instance_of(RagWise::ChunkingService).to receive(:file_chunking).and_return(['test'])
        vector = JSON.parse(File.read(File.join(Rails.root, '/spec/features/rag_wise/vector.json')))['vector']
        allow_any_instance_of(RagWise::LlmService).to receive(:generate_embeddings_from_chunks).
          and_return([vector])

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

      scenario 'I can add and remove files from knowledge base (plural)' do
        allow_any_instance_of(RagWise::ChunkingService).to receive(:file_chunking).and_return(['test'])
        vector = JSON.parse(File.read(File.join(Rails.root, '/spec/features/rag_wise/vector.json')))['vector']
        allow_any_instance_of(RagWise::LlmService).to receive(:generate_embeddings_from_chunks).
          and_return([vector])

        # inserting files
        pdf_file = File.join(Rails.root, '/spec/fixtures/files/two-page-document-with-text.pdf')
        txt_file = File.join(Rails.root, '/spec/fixtures/files/text.txt')
        find('#upload-files-button').click
        find('input[type="file"]', visible: false).attach_file([pdf_file, txt_file], make_visible: true)
        find('button#material-upload-form-upload-button').click
        wait_for_page
        first_file = parent_folder.materials.first
        second_file = parent_folder.materials[1]

        visit course_admin_rag_wise_path(course)

        find('label', text: 'Expand all folders').click
        expect(first_file.reload.workflow_state).to eq('not_chunked')
        expect(second_file.reload.workflow_state).to eq('not_chunked')

        # toggle knowledge base button
        folder_switch = find('.MuiListItemText-root span', text: 'Root').
                        ancestor('div.items-center').find('.MuiSwitch-root')
        folder_switch.click
        wait_for_page
        expect(first_file.reload.workflow_state).to eq('chunked')
        expect(second_file.reload.workflow_state).to eq('chunked')
        folder_switch.click
        wait_for_page
        expect(first_file.reload.workflow_state).to eq('not_chunked')
        expect(second_file.reload.workflow_state).to eq('not_chunked')
      end

      scenario 'I cannot add file to knowledge base' do
        allow_any_instance_of(RagWise::ChunkingService).to receive(:file_chunking).and_return(['test'])
        allow_any_instance_of(RagWise::LlmService).to receive(:generate_embeddings_from_chunks).
          and_return(nil)

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
        wait_for_page
        expect_toastify("#{txt_file_name} could not be added to knowledge base.", dismiss: true)
        expect(file.reload.workflow_state).to eq('not_chunked')
      end
    end
  end
end
