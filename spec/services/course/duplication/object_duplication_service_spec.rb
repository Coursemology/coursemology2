# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Duplication::ObjectDuplicationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:source_course) { create(:course) }
    let(:destination_course) { create(:course) }
    let(:options) { { current_course: source_course, target_course: destination_course } }
    let(:source_objects) { [] }
    let(:excluded_objects) { [] }

    describe '#duplicate_objects' do
      let(:duplicate_objects) do
        Course::Duplication::ObjectDuplicationService.duplicate_objects(source_objects, options)
      end

      context 'when an item fails to duplicate' do
        let(:milestone) { create(:course_lesson_plan_milestone, course: source_course) }
        let(:invalid_skill) do
          create(:course_assessment_skill, course: source_course).tap do |skill|
            skill.title = nil
          end
        end
        let(:source_objects) { [invalid_skill, milestone] }

        it 'rolls back the whole transaction' do
          expect { duplicate_objects }.to change { destination_course.lesson_plan_milestones.count }.by(0)
        end
      end

      context 'when an achievement is selected' do
        let(:achievement) { create(:course_achievement, :with_badge, course: source_course) }
        let(:source_objects) { [achievement] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.achievements.count }.by(1)
          expect(duplicate_objects.first.title).to eq(achievement.title)
        end
      end

      context 'when an assessment is selected' do
        let(:assessment) { create(:assessment, course: source_course) }
        let(:source_objects) { [assessment] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.assessments.count }.by(1)
          expect(duplicate_objects.first.title).to eq(assessment.title)
        end
      end

      context 'when an assessment category is selected' do
        let(:category) { create(:course_assessment_category, course: source_course) }
        let(:source_objects) { [category] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.assessment_categories.count }.by(1)
          expect(duplicate_objects.first.title).to eq(category.title)
        end
      end

      context 'when an assessment skill is selected' do
        let(:skill) { create(:course_assessment_skill, course: source_course) }
        let(:source_objects) { [skill] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.assessment_skills.count }.by(1)
          expect(duplicate_objects.first.title).to eq(skill.title)
        end
      end

      context 'when an assessment skill branch is selected' do
        let(:branch) do
          create(:course_assessment_skill_branch, :with_skill, course: source_course, skill_count: 2)
        end
        let(:source_objects) { [branch] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.assessment_skill_branches.count }.by(1)
          expect(duplicate_objects.first.title).to eq(branch.title)
        end
      end

      context 'when a forum is selected' do
        let(:forum) { create(:forum, course: source_course) }
        let(:source_objects) { [forum] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.forums.count }.by(1)
          expect(duplicate_objects.first.name).to eq(forum.name)
        end
      end

      context 'when a lesson plan event is selected' do
        let(:event) { create(:course_lesson_plan_event, course: source_course) }
        let(:source_objects) { [event] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.lesson_plan_events.count }.by(1)
          expect(duplicate_objects.first.title).to eq(event.title)
        end
      end

      context 'when a lesson plan milestone is selected' do
        let(:milestone) { create(:course_lesson_plan_milestone, course: source_course) }
        let(:source_objects) { [milestone] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.lesson_plan_milestones.count }.by(1)
          expect(duplicate_objects.first.title).to eq(milestone.title)
        end
      end

      context 'when levels are selected' do
        let(:levels) { create_list(:course_level, 3, course: source_course) }
        let(:source_objects) { levels }

        it 'duplicates them' do
          expect { duplicate_objects }.to change { destination_course.levels.count }.by(3)
        end
      end

      context 'when a material folder is selected' do
        let(:folder) { create(:course_material_folder, course: source_course) }
        let!(:content) { create(:course_material, folder: folder) }
        let(:source_objects) { [folder] }

        it 'duplicates the folder and its contents' do
          expect { duplicate_objects }.to change { destination_course.material_folders.count }.by(1)
          expect(folder.reload.materials.first.name).to eq(content.name)
        end
      end

      context 'when a survey is selected' do
        let(:survey) { create(:survey, course: source_course) }
        let(:source_objects) { [survey] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.surveys.count }.by(1)
          expect(duplicate_objects.first.title).to eq(survey.title)
        end
      end

      context 'when a video is selected' do
        let(:video) { create(:video, course: source_course) }
        let(:source_objects) { [video] }

        it 'duplicates it' do
          expect { duplicate_objects }.to change { destination_course.videos.count }.by(1)
          expect(duplicate_objects.first.title).to eq(video.title)
        end
      end
    end
  end
end
