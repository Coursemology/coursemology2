# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Duplication::CourseDuplicationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let(:course) { create(:course) }
    let(:time_shift) { 3.days }
    let(:new_course) do
      options = {
        current_user: admin,
        new_start_at: (course.start_at + time_shift).iso8601,
        new_title: I18n.t('course.duplications.show.new_course_title_prefix')
      }
      Course::Duplication::CourseDuplicationService.duplicate_course(course, options)
    end
    let!(:assessment) { create(:assessment, *assessment_traits, course: course) }
    let(:assessment_traits) { [] }
    let!(:survey) { create(:survey, course: course) }

    describe '#duplicate_course' do
      context 'when saving fails' do
        let!(:invalid_event) do
          create(:course_lesson_plan_event, course: course).tap do |event|
            event.acting_as.update_columns(time_bonus_exp: 1)
            event.acting_as.default_reference_time.update_columns(bonus_end_at: nil)
          end
        end

        it 'rolls back the whole transaction' do
          expect { new_course }.to change { Course.count }.by(0)
          expect(new_course).to be_nil
        end
      end

      context 'when children are simple' do
        let!(:forum) { create(:forum, course: course) }
        let!(:milestones) { create_list(:course_lesson_plan_milestone, 3, course: course) }
        let!(:event) { create(:course_lesson_plan_event, course: course) }
        let!(:video) { create(:video, course: course) }

        it 'duplicates a course with the new title' do
          # Also test that a course with a registration key can be duplicated.
          course.registration_key = 'abcde'
          expect(new_course).to_not be course
          expect(new_course.title).to eq I18n.t('course.duplications.show.new_course_title_prefix')

          # Throws error if database contraints are violated.
          new_course.save!
          expect(new_course.registration_key).to be_nil
        end

        it 'sets the creator of the new course to the current user' do
          expect(new_course.creator).to eq admin
          expect(new_course.creator).not_to eq course.creator
        end

        it 'time shifts the new course' do
          expect(new_course.start_at).to be_within(1.second).of course.start_at + time_shift
          expect(new_course.end_at).to be_within(1.second).of course.end_at + time_shift
        end

        it 'duplicates levels within the course' do
          course.levels.concat(create_list(:course_level, 5, course: course))
          course_levels = course.levels.map(&:experience_points_threshold)
          new_course_levels = new_course.levels.map(&:experience_points_threshold)
          expect(new_course_levels).to match_array course_levels
        end

        it 'duplicates forums' do
          # Check duplicated forum is a different object
          expect(new_course.forums).to_not be course.forums
          expect(new_course.forums.first.course).to eq new_course

          # Check duplicated forum attributes
          expect(new_course.forums.first.name).to eq forum.name
          expect(new_course.forums.first.slug).to eq forum.slug
          expect(new_course.forums.first.description).to eq forum.description
        end

        it 'duplicates lesson plan events' do
          new_lesson_plan_events = new_course.lesson_plan_items.select do |item|
            item.actable_type == 'Course::LessonPlan::Event'
          end
          original_lesson_plan_events = course.lesson_plan_items.select do |item|
            item.actable_type == 'Course::LessonPlan::Event'
          end

          # Check duplicated lesson plan events are assigned to the new course
          new_lesson_plan_events.each do |event|
            expect(event.course).to eq new_course
          end

          original_lesson_plan_events.each_index do |i|
            expect(new_lesson_plan_events[i].actable.event_type).
              to eq original_lesson_plan_events[i].actable.event_type
            expect(new_lesson_plan_events[i].start_at).
              to be_within(1.second).of original_lesson_plan_events[i].start_at + time_shift
            expect(new_lesson_plan_events[i].title).
              to be >= original_lesson_plan_events[i].title
            expect(new_lesson_plan_events[i].description).
              to be >= original_lesson_plan_events[i].description
          end
        end

        it 'duplicates lesson plan milestones' do
          # Check that new milestones are assigned to the new course
          old_milestones = course.lesson_plan_milestones.sort_by(&:title)
          new_milestones = new_course.lesson_plan_milestones.sort_by(&:title)
          new_milestones.each do |new_milestone|
            expect(new_milestone.course).to eq new_course
          end

          # Check attributes of duplicated milestones
          new_milestones.each_with_index do |new, i|
            expect(new.title).
              to eq old_milestones[i].title
            expect(new.description).
              to eq old_milestones[i].description
            expect(new.start_at).
              to be_within(1.second).of old_milestones[i].start_at + time_shift
          end
        end

        it 'duplicates video tabs' do
          new_tab = new_course.video_tabs.first
          expect(new_tab.title).to eq video.tab.title
          expect(new_tab.weight).to eq video.tab.weight
          expect(new_tab.creator).to eq video.tab.creator
        end

        it 'duplicates videos' do
          new_video = new_course.videos.first

          expect(new_video.title).to eq video.title
          expect(new_video.url).to eq video.url
          expect(new_video.creator).to eq video.creator
          expect(new_video.start_at).to be_within(1.second).of video.start_at + time_shift
          expect(new_video.tab).to eq new_course.video_tabs.first
        end
      end

      context 'when assessment has no children' do
        it 'duplicates assessment attributes' do
          new_assessment = new_course.assessments.first
          expect(new_assessment).to_not be assessment
          expect(new_assessment.title).to eq assessment.title
          expect(new_assessment.description).to eq assessment.description
          expect(new_assessment.base_exp).to eq assessment.base_exp
          expect(new_assessment.time_bonus_exp).to eq assessment.time_bonus_exp
          expect(new_assessment.published).to eq assessment.published
          expect(new_assessment.start_at).to be_within(1.second).of assessment.start_at + time_shift
          expect(new_assessment.bonus_end_at).to be_within(1.second).
            of assessment.bonus_end_at + time_shift
          # Source assessment has no end date
          expect(new_assessment.end_at).to be_nil
        end

        it 'duplicates lesson plan items acting as assessments' do
          new_lesson_plan_item = new_course.lesson_plan_items.first
          expect(new_lesson_plan_item).to_not be course.lesson_plan_items.first
          expect(new_lesson_plan_item).to_not eq course.lesson_plan_items.first
        end
      end

      context 'when assessment has all question types' do
        let(:assessment_traits) { [:with_all_question_types] }

        it 'duplicates questions' do
          # Check that the assessments have the same number of questions
          new_assessment = new_course.assessments.first
          expect(new_assessment.questions.size).to eq assessment.questions.size

          new_questions = new_assessment.questions
          new_question_assessments = new_assessment.question_assessments
          questions = assessment.questions

          # Check that the attributes are duplicated
          attributes = [:title, :description, :actable_type, :staff_only_comments, :maximum_grade]
          attributes.each do |attribute|
            new_attribs = new_questions.map(&attribute)
            attribs = questions.map(&attribute)
            expect(new_attribs).to match_array attribs
          end

          expect(assessment.question_assessments.map(&:weight)).to match_array new_question_assessments.map(&:weight)

          # Check that duplicated questions belong to the duplicated course
          new_question_assessments.each do |question_assessment|
            expect(question_assessment.assessment.course).to eq new_course
          end
        end

        it 'duplicates the attachment reference but not the attachment' do
          new_programming_question = new_course.assessments.first.questions.select do |q|
            q.actable_type == 'Course::Assessment::Question::Programming'
          end[0]
          programming_question = course.assessments.first.questions.select do |q|
            q.actable_type == 'Course::Assessment::Question::Programming'
          end[0]

          new_attachment_reference = new_programming_question.actable.attachment
          attachment_reference = programming_question.actable.attachment

          expect(new_attachment_reference).to_not be attachment_reference
          expect(new_attachment_reference).to_not eq attachment_reference

          new_attachment = new_attachment_reference.attachment
          attachment = attachment_reference.attachment
          expect(new_attachment).to eq attachment
        end
      end

      context 'when assessment has attachments' do
        let(:assessment_traits) { [:with_attachments] }

        it 'duplicates the attachment reference but not the attachment' do
          new_attachment_reference = new_course.assessments.first.folder.materials.first.attachment
          attachment_reference = course.assessments.first.folder.materials.first.attachment
          expect(new_attachment_reference).to_not be attachment_reference
          expect(new_attachment_reference).to_not eq attachment_reference

          new_attachment = new_attachment_reference.attachment
          attachment = attachment_reference.attachment
          expect(new_attachment).to eq attachment
        end
      end

      context 'when course has extra material folders' do
        let!(:creator) { create(:course_manager, course: course).user }
        let!(:updater) { create(:course_teaching_assistant, course: course).user }
        let!(:folders) do
          create_list(:course_material_folder, 3, parent: course.root_folder,
                                                  course: course, creator: creator)
        end

        let!(:content) { create(:course_material, folder: folders[0], creator: creator) }

        before do
          # Updater cannot be assigned in `create` as it will be overwritten.
          content.update_column(:updater_id, updater.id)
          folders.each.map { |folder| folder.update_column(:updater_id, updater.id) }

          # Fix creator/updater for attachment reference
          content.attachment.update_column(:creator_id, creator.id)
          content.attachment.update_column(:updater_id, updater.id)

          course.reload
          new_course.reload

          @new_folders = new_course.material_folders
          @original_folders = course.material_folders
          # Retrieve duplicated material through the folders of the duplicated course
          @new_content = @new_folders.select { |f| f.name == folders[0].name }[0].materials.first
          # Retrieve original material from the database so the timestamp precisions will match
          @content = @original_folders.select { |f| f.name == folders[0].name }[0].materials.first
        end

        it 'duplicates the folders and their contents' do
          @new_folders.each do |folder|
            expect(folder.course).to eq new_course
          end
          expect(@new_folders.map(&:name)).to match_array @original_folders.map(&:name)
          expect(@new_content.name).to eq @content.name
          expect(@new_content.description).to eq @content.description
        end

        it 'keeps the original updater/creator and updated/created time'\
           'for folders and materials' do
          # Check material's updater/creator and updated/created time
          expect(@new_content.updated_at).to eq @content.updated_at
          expect(@new_content.updater_id).to eq @content.updater_id
          expect(@new_content.created_at).to eq @content.created_at
          expect(@new_content.creator_id).to eq @content.creator_id

          # Check folders' updater/creator and updated/created time
          expect(@new_folders.map(&:updated_at)).to match_array @original_folders.map(&:updated_at)
          expect(@new_folders.map(&:updater_id)).to match_array @original_folders.map(&:updater_id)
          expect(@new_folders.map(&:created_at)).to match_array @original_folders.map(&:created_at)
          expect(@new_folders.map(&:creator_id)).to match_array @original_folders.map(&:creator_id)
        end

        it 'keeps the original updater/creator and updated/created time'\
           'for attachment references' do
          expect(@new_content.attachment.updated_at).to eq @content.attachment.updated_at
          expect(@new_content.attachment.updater).to eq @content.attachment.updater
          expect(@new_content.attachment.created_at).to eq @content.attachment.created_at
          expect(@new_content.attachment.creator).to eq @content.attachment.creator
        end

        it 'shifts the start and end times for non-root folders' do
          # Start at of the root folder should not be shifted
          expect(new_course.root_folder.start_at).
            to be_within(1.second).of new_course.root_folder.created_at

          # Select just the folders that were created in this context and sort them by name.
          new_standalone_folders = @new_folders.select do |folder|
            folders.map(&:name).include?(folder.name)
          end
          new_standalone_folders.sort_by!(&:name)

          folders_array = new_standalone_folders.zip(folders)
          folders_array.each do |new_folder, original_folder|
            expect(new_folder.start_at).
              to be_within(1.second).of original_folder.start_at + time_shift
            expect(new_folder.end_at).to be_within(1.second).of original_folder.end_at + time_shift
          end
        end
      end

      context 'when course has assessment skills and skill branch' do
        let!(:branch) { create(:course_assessment_skill_branch, :with_skill, course: course) }
        let!(:standalone_skill) { create(:course_assessment_skill, course: course) }

        it 'duplicates skills and skill branches' do
          new_skills = new_course.assessment_skills
          original_skills = course.assessment_skills
          new_branch = new_course.assessment_skill_branches.first
          original_branch = course.assessment_skill_branches.first

          # Check course of duplicated skills and branches
          new_skills.each do |skill|
            expect(skill.course).to eq new_course
          end
          # This test only has 1 skills branch
          expect(new_branch.course).to eq new_course

          expect(new_skills.map(&:title)).to match_array original_skills.map(&:title)
          expect(new_skills.map(&:description)).to match_array original_skills.map(&:description)

          expect(new_branch.skills.first).not_to eq original_branch.skills.first
        end
      end

      context 'when course has achievements' do
        # Create 2 achievements. The first depends on the second achievement and a level.
        let!(:achievements) { create_list(:course_achievement, 2, course: course) }
        let!(:achievement_with_badge) { create(:course_achievement, :with_badge, course: course) }
        let!(:achievement_condition) do
          create(:course_condition_achievement, course: course, achievement: achievements[1],
                                                conditional: achievements[0])
        end
        let!(:level_condition) do
          create(:course_condition_level, course: course, conditional: achievements[0])
        end
        # This condition is necessary to make sure achievements are declared after material_folders
        # in the definition of the Course model.
        let!(:assessment_condition) do
          create(:course_condition_assessment, course: course, assessment: assessment,
                                               conditional: achievements[0])
        end

        it 'duplicates achievements' do
          new_achievements = new_course.achievements

          # Check that new achievements are assigned to the right course
          new_achievements.each do |achievement|
            expect(achievement.course).to eq new_course
          end

          # Check that the attributes are duplicated
          attributes = [:title, :description, :weight, :published]
          attributes.each do |attribute|
            new_attribs = new_achievements.map(&attribute)
            attribs = course.achievements.map(&attribute)
            expect(new_attribs).to match_array attribs
          end
        end

        it 'duplicates achievement with attached badge' do
          new_achievement_with_badge = new_course.achievements.select(&:badge_url).first
          new_achievement_id = new_achievement_with_badge.id
          badge_folder = Rails.root.join('public', 'uploads', 'images', 'course',
                                         'achievement', new_achievement_id.to_s, 'badge')
          badge_file = badge_folder.join('minion.png')
          expect(File.directory?(badge_folder)).to be true
          expect(File.exist?(badge_file)).to be true
        end

        it 'duplicates achievement conditions' do
          original_conditions = course.achievements.first.conditions
          new_conditions = new_course.achievements.first.conditions

          # Check that the new conditions are assigned to the new achievement
          new_conditions.each do |cond|
            expect(cond.conditional).to eq new_course.achievements.first
          end

          # Check that condition types match
          expect(new_conditions.map(&:actable_type)).
            to match_array original_conditions.map(&:actable_type)
        end
      end

      context 'when survey has no children' do
        let!(:survey) { create(:survey, section_count: 0, course: course) }
        it 'duplicates assessment attributes' do
          new_survey = new_course.surveys.first
          expect(new_survey).to_not be survey
          expect(new_survey.title).to eq survey.title
          expect(new_survey.description).to eq survey.description
          expect(new_survey.base_exp).to eq survey.base_exp
          expect(new_survey.time_bonus_exp).to eq survey.time_bonus_exp
          expect(new_survey.published).to eq survey.published
          expect(new_survey.start_at).to be_within(1.second).of survey.start_at + time_shift
          expect(new_survey.bonus_end_at).to be_within(1.second).
            of survey.bonus_end_at + time_shift
          # Source survey has no end date
          expect(new_survey.end_at).to be_nil
        end

        it 'duplicates lesson plan items acting as assessments' do
          new_lesson_plan_item = new_course.lesson_plan_items.second
          expect(new_lesson_plan_item).to_not be course.lesson_plan_items.second
          expect(new_lesson_plan_item).to_not eq course.lesson_plan_items.second
        end
      end

      context 'when survey has all question types' do
        let!(:survey) do
          create(:survey, section_traits: [:with_all_question_types], course: course)
        end

        it 'duplicates questions' do
          # Check that the surveys have the same number of sections
          new_survey = new_course.surveys.first
          expect(new_survey.sections.size).to eq survey.sections.size

          # Check that the survey sections have the same number of questions
          new_section = new_survey.sections.first
          section = survey.sections.first
          expect(new_section.questions.size).to eq section.questions.size

          new_questions = new_section.questions
          questions = survey.questions

          # Check that the attributes are duplicated
          attributes = [:question_type, :description, :required, :grid_view, :max_options, :min_options]
          attributes.each do |attribute|
            new_attribs = new_questions.map(&attribute)
            attribs = questions.map(&attribute)
            expect(new_attribs).to match_array attribs
          end

          # Check that duplicated questions belong to the duplicated course
          new_questions.each do |question|
            expect(question.section.survey.course).to eq new_course
          end
        end
      end

      context 'when survey question options has attachments' do
        let!(:survey_question) do
          create(:survey_question, :multiple_choice, section: survey.sections.first,
                                                     option_traits: [:with_attachment])
        end

        it 'duplicates the question options' do
          new_survey_question = new_course.surveys.first.sections.first.questions.first

          # Check that the survey questions have the same number of options
          expect(new_survey_question.options.size).to eq survey_question.options.size

          # Check that the attributes are duplicated
          attributes = [:option, :weight]
          attributes.each do |attribute|
            new_attribs = new_survey_question.options.map(&attribute)
            attribs = survey_question.options.map(&attribute)
            expect(new_attribs).to match_array attribs
          end
        end

        it 'duplicates the attachment references but not the attachments' do
          new_survey_question = new_course.surveys.first.sections.first.questions.first
          new_attachment_reference = new_survey_question.options.first.attachment_reference
          attachment_reference = survey_question.options.first.attachment

          expect(new_attachment_reference).to_not be attachment_reference
          expect(new_attachment_reference).to_not eq attachment_reference

          new_attachment = new_attachment_reference.attachment
          attachment = attachment_reference.attachment
          expect(new_attachment).to eq attachment
        end
      end

      context 'when assessment categories have settings' do
        let!(:categories) { create_list(:course_assessment_category, 2, course: course) }

        before do
          context = OpenStruct.new(key: Course::AssessmentsComponent.key, current_course: course)
          settings_interface = Course::Settings::AssessmentsComponent.new(context)
          course.assessment_categories.each do |category|
            setting = {
              'key' => 'new_comment', 'enabled' => false, 'options' => { 'category_id' => category.id }
            }
            settings_interface.update_email_setting(setting)
          end
          course.save!
        end

        it 'duplicates the settings' do
          all_new_comment_emails_disabled = new_course.assessment_categories.none? do |category|
            Course::Settings::AssessmentsComponent.email_enabled?(category, :new_comment)
          end

          expect(all_new_comment_emails_disabled).to be(true)
        end
      end

      context 'when sidebar settings have multiple assessment categories' do
        let!(:categories) { create_list(:course_assessment_category, 2, course: course) }

        before do
          # Assign sidebar settings for original course by setting the weight to the old
          # category ID.
          course.assessment_categories.each do |category|
            course.settings(:sidebar).settings("assessments_#{category.id}").weight = category.id
          end
          course.save!
        end

        it 'updates the sidebar setting keys with the new assessment category IDs' do
          old_course_weights = course.assessment_categories.map(&:id)
          new_course_weights = new_course.assessment_categories.map do |category|
            new_course.settings(:sidebar).settings("assessments_#{category.id}").weight
          end
          expect(new_course_weights).to contain_exactly(*old_course_weights)

          # Check that sidebar keys with the old assessment category IDs are not in the new course's
          # sidebar settings.
          course.assessment_categories.each do |old_category|
            expect(new_course.settings(:sidebar, "assessments_#{old_category.id}").weight).to be_nil
          end

          # Check that the sidebar keys of the source course are not affected.
          course.reload.assessment_categories.each do |old_category|
            expect(course.settings(:sidebar, "assessments_#{old_category.id}").weight).
              to eq old_category.id
          end
        end
      end
    end
  end
end
