# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::ZipDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_staff) { create(:course_teaching_assistant, course: course) }
    let(:assessment) { create(:assessment, :published_with_text_response_question, course: course) }
    let(:student1) { create(:course_user, course: course, name: 'Student') }
    let(:student2) { create(:course_user, course: course, name: 'Student') }

    let(:submission1) do
      create(:submission, :submitted, assessment: assessment,
                                      course: course, creator: student1.user).tap do |submission|
        attachment = create(:attachment_reference, name: 'answer.txt')
        attachment.save!
        answer = submission.answers.first.specific
        answer.attachment_references << attachment
        answer.save!
      end
    end

    let(:submission2) do
      create(:submission, :submitted, assessment: assessment,
                                      course: course, creator: student2.user).tap do |submission|
        attachment = create(:attachment_reference, name: 'answer.txt')
        attachment.save!
        answer = submission.answers.first.specific
        answer.attachment_references << attachment
        answer.save!
      end
    end

    let(:service) do
      Course::Assessment::Submission::ZipDownloadService.send(:new, course_staff, assessment, nil)
    end

    describe '#download_to_base_dir' do
      let(:dir) { service.instance_variable_get(:@base_dir) }
      subject { service.send(:download_to_base_dir) }

      let(:student2) { create(:course_user, course: course, name: 'Student 2') }
      let(:student3) { create(:course_user, :phantom, course: course, name: 'Student 3') }

      let(:submission3) do
        create(:submission, :submitted, assessment: assessment,
                                        course: course, creator: student3.user)
      end

      # Add student 2 to a group
      let!(:group) do
        group = create(:course_group, course: course)
        create(:course_group_manager, course: course, group: group, course_user: course_staff)
        create(:course_group_student, course: course, group: group, course_user: student2)
        group
      end

      types = Course::Assessment::Submission::ZipDownloadService::STUDENTS

      before do
        submission1
        submission2
        submission3
      end

      context 'when downloading submissions by my students' do
        it 'downloads the correct submissions' do
          service.instance_variable_set(:@students, types[:my])
          subject

          file_names = Dir.entries(dir)
          expect(file_names).not_to include(student1.name)
          expect(file_names).to include(student2.name)
          expect(file_names).not_to include(student3.name)
        end
      end

      context 'when downloading submissions by non-phantom students' do
        it 'downloads the correct submissions' do
          subject

          file_names = Dir.entries(dir)
          expect(file_names).to include(student1.name)
          expect(file_names).to include(student2.name)
          expect(file_names).not_to include(student3.name)
        end
      end

      context 'when downloading submissions by phantom students' do
        it 'downloads the correct submissions' do
          service.instance_variable_set(:@students, types[:phantom])
          subject

          file_names = Dir.entries(dir)
          expect(file_names).not_to include(student1.name)
          expect(file_names).not_to include(student2.name)
          expect(file_names).to include(student3.name)
        end
      end
    end

    describe '#zip_base_dir' do
      let(:dir) do
        service.send(:download_to_base_dir)
        service.instance_variable_get(:@base_dir)
      end
      subject { service.send(:zip_base_dir) }

      context 'when there are no submissions' do
        it 'produces an empty zip file' do
          dir
          expect(subject).to be_present
          file_names = Zip::File.open(subject) { |f| f.map(&:name) }
          expect(file_names).to be_empty
        end
      end

      context 'when there is a file named "answer.txt"' do
        it 'renames the file' do
          submission1
          dir

          expect(subject).to be_present

          assessment_title = Pathname.normalize_filename(assessment.questions.first.display_title)

          file_names = Zip::File.open(subject) { |f| f.map(&:name) }
          expect(file_names).to contain_exactly(
            student1.name + '/',
            student1.name + '/' + assessment_title + '/',
            student1.name + '/' + assessment_title + '/' + 'answer.txt',
            student1.name + '/' + assessment_title + '/' + 'answer (0).txt'
          )
        end
      end

      context 'when there are multiple students with the same name' do
        it 'downloads the submission files in different directories' do
          submission1
          submission2
          dir

          expect(subject).to be_present

          student2_name = "#{student2.name} (0)"
          assessment_title = Pathname.normalize_filename(assessment.questions.first.display_title)

          file_names = Zip::File.open(subject) { |f| f.map(&:name) }
          expect(file_names).to contain_exactly(
            student1.name + '/',
            student1.name + '/' + assessment_title + '/',
            student1.name + '/' + assessment_title + '/' + 'answer.txt',
            student1.name + '/' + assessment_title + '/' + 'answer (0).txt',
            student2_name + '/',
            student2_name + '/' + assessment_title + '/',
            student2_name + '/' + assessment_title + '/' + 'answer.txt',
            student2_name + '/' + assessment_title + '/' + 'answer (0).txt'
          )
        end
      end
    end

    describe '.download_and_zip' do
      subject do
        Course::Assessment::Submission::ZipDownloadService.
          download_and_zip(course_staff, assessment, nil)
      end

      it 'downloads and zips the folder' do
        submission1
        submission2
        expect(File.exist?(subject)).to be_truthy
      end
    end
  end
end
