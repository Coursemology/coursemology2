# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SsidPlagiarismService do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
    let!(:submission1) { create(:course_assessment_submission, :submitted, assessment: assessment, course: course) }
    let!(:submission2) { create(:course_assessment_submission, :submitted, assessment: assessment, course: course) }

    subject { described_class.new(course, assessment) }

    let(:stubs) { Faraday::Adapter::Test::Stubs.new }
    let(:connection) do
      Faraday.new(url: 'http://localhost:53897') do |builder|
        builder.adapter :test, stubs
      end
    end

    before do
      allow_any_instance_of(SsidAsyncApiService).to receive(:connection).and_return(connection)
      allow_any_instance_of(Course::Assessment::Submission::SsidZipDownloadService).to receive(:download_and_zip).
        and_return([File.join(Rails.root, 'spec/fixtures/course/ssid/submissions.zip')])
    end

    after do
      stubs.verify_stubbed_calls
    end

    describe '#initialize' do
      it 'initializes with course and assessment' do
        service = described_class.new(course, assessment)
        expect(service.instance_variable_get(:@course)).to eq(course)
        expect(service.instance_variable_get(:@main_assessment)).to eq(assessment)
      end
    end

    describe '#start_plagiarism_check' do
      before do
        stubs.post('/folders') do
          [Ssid::ApiStubs::CREATE_FOLDER_SUCCESS[:status],
           { 'Content-Type': 'application/json' },
           Ssid::ApiStubs::CREATE_FOLDER_SUCCESS[:body]]
        end
        stubs.post(/folders\/.*\/submissions/) do |env|
          expect(env[:url].to_s).to include("/folders/#{assessment.ssid_folder_id}/submissions")
          [Ssid::ApiStubs::UPLOAD_ANSWERS_SUCCESS[:status],
           { 'Content-Type': 'application/json' },
           Ssid::ApiStubs::UPLOAD_ANSWERS_SUCCESS[:body]]
        end
        stubs.post(/folders\/.*\/plagiarism-checks/) do |env|
          expect(env[:url].to_s).to include("/folders/#{assessment.ssid_folder_id}/plagiarism-checks")
          [Ssid::ApiStubs::SEND_PLAGIARISM_CHECK_SUCCESS[:status],
           { 'Content-Type': 'application/json' },
           Ssid::ApiStubs::SEND_PLAGIARISM_CHECK_SUCCESS[:body]]
        end
        stubs.get(/folders\/.*\/plagiarism-checks/) do |env|
          expect(env[:url].to_s).to include("/folders/#{assessment.ssid_folder_id}/plagiarism-checks")
          [Ssid::ApiStubs::FETCH_PLAGIARISM_CHECK_SUCCESSFUL[:status],
           { 'Content-Type': 'application/json' },
           Ssid::ApiStubs::FETCH_PLAGIARISM_CHECK_SUCCESSFUL[:body]]
        end
      end

      it 'completes similarity check successfully' do
        subject.start_plagiarism_check
        response = subject.fetch_plagiarism_check_result
        expect(response['status']).to eq('successful')
      end
    end

    describe '#fetch_plagiarism_result' do
      let(:limit) { 100 }
      let(:offset) { 200 }
      before do
        stubs.get(/folders\/.*\/plagiarism-checks\/latest\/submission-pairs/) do |env|
          expect(env[:url].to_s).to include(
            "/folders/#{assessment.ssid_folder_id}/plagiarism-checks/latest/submission-pairs"
          )
          expect(env[:params]['limit'].to_s).to eq('100')
          expect(env[:params]['offset'].to_s).to eq('200')
          [Ssid::ApiStubs::FETCH_SSID_SUBMISSION_PAIR_DATA_SUCCESS[:status],
           { 'Content-Type' => 'application/json' },
           Ssid::ApiStubs::FETCH_SSID_SUBMISSION_PAIR_DATA_SUCCESS[:body]]
        end
      end

      it 'fetches plagiarism results successfully' do
        results = subject.fetch_plagiarism_result(limit, offset)
        expect(results).to be_an(Array)
      end
    end

    describe '#download_submission_pair_result' do
      let(:submission_pair_id) { '641eb301-ffbc-44ce-838e-bf5679f990e1' }
      before do
        stubs.get(/submission-pairs\/.*\/report/) do |env|
          expect(env[:url].to_s).to include("/submission-pairs/#{submission_pair_id}/report")
          [Ssid::ApiStubs::DOWNLOAD_SUBMISSION_PAIR_RESULT_SUCCESS[:status],
           { 'Content-Type' => 'application/json' },
           Ssid::ApiStubs::DOWNLOAD_SUBMISSION_PAIR_RESULT_SUCCESS[:body]]
        end
      end

      it 'returns the report content' do
        result = subject.download_submission_pair_result(submission_pair_id)
        expect(result).to eq('<html><body>Report content</body></html>')
      end
    end

    describe '#share_submission_pair_result' do
      let(:submission_pair_id) { '641eb301-ffbc-44ce-838e-bf5679f990e1' }
      before do
        stubs.post('/shared-resources') do |env|
          expect(env[:body]).to eq({
            resourceType: 'submission_pair',
            resourceId: submission_pair_id
          }.to_json)
          [Ssid::ApiStubs::CREATE_SHARED_RESOURCE_LINK_SUCCESS[:status],
           { 'Content-Type' => 'application/json' },
           Ssid::ApiStubs::CREATE_SHARED_RESOURCE_LINK_SUCCESS[:body]]
        end
      end

      it 'creates shared link and returns URL' do
        url = subject.share_submission_pair_result(submission_pair_id)
        expect(url).to eq('https://ssid.comp.nus.edu.sg/shared-urls/-o3Gs5JjySuiKWeIxo4Q4sVYesw0E_he_LH__MK-440')
      end
    end
  end
end
