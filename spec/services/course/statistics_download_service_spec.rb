# frozen_string_literal: true
require 'rails_helper'
require 'csv'

RSpec.describe Course::StatisticsDownloadService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, :with_video_component_enabled) }
    let(:students) { create_list(:course_student, 3, course: course) }
    let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
    let(:another_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    let(:group) do
      group = create(:course_group, course: course)
      create(:course_group_manager, group: group, course_user: teaching_assistant)
      create(:course_group_user, group: group, course_user: students.first)
      create(:course_group_user, group: group, course_user: students.second)
      group
    end

    describe '#generate_csv' do
      subject do
        CSV.parse(Course::StatisticsDownloadService.send(:generate_csv, course, teaching_assistant, true, true))
      end

      context 'headers' do
        context 'non-gamified course' do
          let(:course) do
            create(:course, gamified: false)
          end

          it 'does not have EXP' do
            expect(subject[0]).not_to include(I18n.t('course.statistics.table.experience_points'))
          end

          it 'does not have level' do
            expect(subject[0]).not_to include(Course::Level.model_name.human)
          end
        end

        context 'gamified course' do
          it 'has EXP' do
            expect(subject[0]).to include(I18n.t('course.statistics.table.experience_points'))
          end

          it 'has level' do
            expect(subject[0]).to include(Course::Level.model_name.human)
          end
        end

        context 'no group managers' do
          it 'does not have tutor' do
            expect(subject[0]).not_to include(I18n.t('course.statistics.table.tutor'))
          end
        end

        context 'with group managers' do
          it 'has tutor' do
            group
            expect(subject[0]).to include(I18n.t('course.statistics.table.tutor'))
          end
        end

        context 'course with no video component' do
          let(:course) do
            create(:course)
          end

          it 'does not have video-related headers' do
            expect(subject[0]).not_to include(I18n.t('course.statistics.table.video_watched',
                                                     total: course.videos&.count))
            expect(subject[0]).not_to include(I18n.t('course.statistics.table.percent_watched'))
          end
        end

        context 'course with video component' do
          before do
            create(:video, :published, course: course)
          end

          it 'has video-related headers' do
            expect(subject[0]).to include(I18n.t('course.statistics.table.video_watched', total: course.videos&.count))
            expect(subject[0]).to include(I18n.t('course.statistics.table.percent_watched'))
          end
        end
      end

      context 'rows' do
        it 'does not include other students when only_my_students is true' do
          group
          name_index = subject[0].index(CourseUser.human_attribute_name(:name))
          expect(subject.size - 1).to eq(2)
          expect(subject[1][name_index]).to eq(students.first.name).or eq(students.second.name)
          expect(subject[2][name_index]).to eq(students.first.name).or eq(students.second.name)
        end
      end
    end

    describe '#generate_row' do
      let(:no_group_managers) { true }
      let(:has_video_data) { true }
      let(:student) { students.first }

      subject do
        service = Course::GroupManagerPreloadService.new([teaching_assistant, another_teaching_assistant])
        Course::StatisticsDownloadService.send(:generate_row, student, service, no_group_managers,
                                               course.gamified?, has_video_data)
      end

      context 'basic student data' do
        it 'generates the correct name' do
          expect(subject).to include(student.name)
        end

        it 'generates the correct email' do
          expect(subject).to include(student.user.email)
        end

        it 'generates a normal status for non-phantom students' do
          expect(subject).to include(I18n.t('course.statistics.csv_download_service.normal'))
        end

        it 'generates a phantom status for phantom students' do
          student.phantom = true
          student.save
          expect(subject).to include(I18n.t('course.statistics.csv_download_service.phantom'))
        end
      end

      context 'gamification data' do
        context 'non-gamified course' do
          let(:course) do
            create(:course, gamified: false)
          end

          it 'does not generate the level and EXP' do
            expect(subject.length).to be(5)
          end
        end

        context 'gamified course' do
          before do
            create(:course_level, course: course, experience_points_threshold: 100)
            create(:course_level, course: course, experience_points_threshold: 200)
            create(:course_level, course: course, experience_points_threshold: 300)
            create(:course_experience_points_record, points_awarded: 250, course_user: student)
          end

          it 'generates the correct level' do
            expect(subject).to include(student.level_number)
          end

          it 'generates the correct experience points' do
            expect(subject).to include(student.experience_points)
          end
        end
      end

      context 'tutor data' do
        context 'no group managers' do
          it 'does not generate tutor-related data' do
            expect(subject.length).to be(7)
            expect(subject).not_to include(teaching_assistant.name)
          end
        end

        context 'with group managers' do
          let(:no_group_managers) { false }
          before do
            group
          end

          it 'generates the tutor name' do
            group
            expect(subject).to include(teaching_assistant.name)
          end

          it 'generates a comma-separated list of tutor names when there are multiple tutors' do
            create(:course_group_manager, group: group, course_user: another_teaching_assistant)
            expect(subject).to include("#{teaching_assistant.name}, #{another_teaching_assistant.name}").
              or include("#{another_teaching_assistant.name}, #{teaching_assistant.name}")
          end
        end
      end

      context 'video data' do
        context 'no video data' do
          let(:has_video_data) { false }

          it 'does not generate video-related data' do
            expect(subject.length).to be(5)
          end
        end

        context 'with video data' do
          let(:videos) { create_list(:video, 2, course: course) }
          let!(:submission_one) { create(:video_submission, video: videos.first, creator: student.user) }
          let!(:submission_two) { create(:video_submission, video: videos.second, creator: student.user) }

          it 'generates the correct video submission count' do
            expect(subject).to include(videos.length)
          end

          it 'generates the correct video percent watched' do
            create(:video_session, :with_events_paused, submission: submission_one)
            create(:video_session, :with_events_continuous, submission: submission_two)
            submission_one.update_statistic
            submission_two.update_statistic
            expect(subject).to include(I18n.t('course.statistics.table.progress',
                                              progress: student.video_percent_watched))
          end
        end
      end
    end
  end
end
