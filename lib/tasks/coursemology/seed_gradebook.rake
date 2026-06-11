# frozen_string_literal: true

# Usage: bundle exec rails coursemology:seed_gradebook
# Creates a demo course with 3 categories, multiple assessments, and 20 students
# with varied grades for demonstrating the gradebook.

namespace :coursemology do
  task seed_gradebook: 'db:seed' do
    require 'factory_bot_rails'

    ActsAsTenant.with_tenant(Instance.default) do
      admin_email = User::Email.find_by_email('test@example.org')
      admin = admin_email&.user
      raise 'Missing seeded admin user test@example.org; run `bundle exec rails db:seed` first.' unless admin

      User.stamper = admin

      course = Course.create!(
        title: 'Gradebook Demo Course',
        published: true,
        enrollable: false,
        creator: admin,
        updater: admin
      )

      puts "Created course: #{course.title} (id=#{course.id})"

      # ── Categories, tabs, assessments ──────────────────────────────────────

      structure = [
        {
          title: 'Missions',
          tabs: [
            {
              title: 'Assignments',
              assessments: [
                { title: 'Mission 1 — Variables & Control Flow', max: 20 },
                { title: 'Mission 2 — Functions & Recursion',    max: 20 },
                { title: 'Mission 3 — Data Structures',          max: 25 },
                { title: 'Mission 4 — Sorting Algorithms',       max: 25 }
              ]
            },
            {
              title: 'Optional Missions',
              assessments: [
                { title: 'Optional Mission A — Regex',           max: 10 },
                { title: 'Optional Mission B — Concurrency',     max: 10 }
              ]
            }
          ]
        },
        {
          title: 'Tutorials',
          tabs: [
            {
              title: 'Problem Sets',
              assessments: [
                { title: 'Problem Set 1',  max: 10 },
                { title: 'Problem Set 2',  max: 10 },
                { title: 'Problem Set 3',  max: 10 },
                { title: 'Problem Set 4',  max: 10 },
                { title: 'Problem Set 5',  max: 10 }
              ]
            },
            {
              title: 'Recitation Quizzes',
              assessments: [
                { title: 'Recitation Quiz 1', max: 5 },
                { title: 'Recitation Quiz 2', max: 5 },
                { title: 'Recitation Quiz 3', max: 5 }
              ]
            }
          ]
        },
        {
          title: 'Projects',
          tabs: [
            {
              title: 'Milestones',
              assessments: [
                { title: 'Project Milestone 1 — Proposal',     max: 15 },
                { title: 'Project Milestone 2 — Prototype',    max: 20 },
                { title: 'Project Milestone 3 — Final Report', max: 30 }
              ]
            }
          ]
        }
      ]

      all_assessments = []
      start_at = 1.month.ago
      default_category = course.assessment_categories.first

      structure.each_with_index do |cat_def, cat_i|
        category = if cat_i == 0
                     default_category.update!(title: cat_def[:title], weight: 1)
                     default_category
                   else
                     course.assessment_categories.create!(
                       title: cat_def[:title],
                       weight: cat_i + 1,
                       creator: admin,
                       updater: admin
                     )
                   end

        existing_tab = cat_i == 0 ? category.tabs.first : nil

        cat_def[:tabs].each_with_index do |tab_def, tab_i|
          tab = if existing_tab && tab_i == 0
                  existing_tab.update!(title: tab_def[:title], weight: 1)
                  existing_tab
                else
                  category.tabs.create!(
                    title: tab_def[:title],
                    weight: tab_i + 1,
                    creator: admin,
                    updater: admin
                  )
                end

          tab_def[:assessments].each_with_index do |a_def, a_i|
            assessment = Course::Assessment.new(
              course: course,
              tab: tab,
              title: a_def[:title],
              description: '',
              base_exp: 0,
              autograded: false,
              start_at: start_at + (((cat_i * 10) + (tab_i * 4) + a_i) * 3).days,
              creator: admin,
              updater: admin
            )
            assessment.lesson_plan_item.published = true

            # Build one MCQ question with the desired max grade.
            question = FactoryBot.build(
              :course_assessment_question_multiple_response,
              :multiple_choice,
              maximum_grade: a_def[:max]
            )
            assessment.question_assessments.build(
              question: question.acting_as,
              weight: a_i + 1
            )
            assessment.save!
            all_assessments << { record: assessment, max: a_def[:max] }
            print '.'
          end
        end
      end
      puts "\nCreated #{all_assessments.size} assessments across 3 categories."

      # ── Students ───────────────────────────────────────────────────────────

      student_profiles = [
        # [name, grade_tier]  tier: :high | :mid | :low | :sparse
        ['Alice Tan',        :high],
        ['Bob Lim',          :high],
        ['Carol Chen',       :high],
        ['David Ng',         :high],
        ['Eve Zhang',        :high],
        ['Frank Liu',        :mid],
        ['Grace Wang',       :mid],
        ['Henry Kim',        :mid],
        ['Irene Pham',       :mid],
        ['James Ho',         :mid],
        ['Karen Soh',        :mid],
        ['Leo Bui',          :mid],
        ['Mia Yeo',          :mid],
        ['Nathan Koh',       :low],
        ['Olivia Tan',       :low],
        ['Paul Wu',          :low],
        ['Quinn Lee',        :low],
        ['Rachel Goh',       :sparse],
        ['Samuel Ong',       :sparse],
        ['Tina Chan',        :sparse]
      ]

      rng = Random.new(42) # fixed seed for reproducible grades

      student_profiles.each do |name, tier|
        email = "#{name.downcase.gsub(' ', '.')}@gradebook.demo"
        user = User::Email.find_by_email(email)&.user
        unless user
          user = User.new(name: name, email: email, password: 'Coursemology!')
          user.skip_confirmation!
          user.save!
        end

        course_user = CourseUser.find_or_create_by!(course: course, user: user) do |cu|
          cu.role = :student
          cu.name = name
          cu.creator = admin
          cu.updater = admin
        end

        tier_params = {
          high: [0.95, (0.78..1.00)],
          mid: [0.85, (0.50..0.80)],
          low: [0.70, (0.20..0.55)],
          sparse: [0.40, (0.30..0.70)]
        }
        submission_probability, grade_fraction_range = tier_params[tier]

        all_assessments.each do |a|
          next if rng.rand > submission_probability

          fraction = rng.rand(grade_fraction_range)
          earned = (fraction * a[:max]).round.clamp(0, a[:max])

          submission = Course::Assessment::Submission.new(
            assessment: a[:record],
            creator: user,
            updater: user
          )
          submission.experience_points_record.course_user = course_user
          submission.experience_points_record.creator = user
          submission.experience_points_record.updater = user
          answers = a[:record].questions.attempt(submission)
          answers.each { |ans| ans.current_answer = true }
          submission.answers = answers
          submission.save!

          submission.finalise!
          submission.save!

          submission.answers.reload.each do |answer|
            answer.grade = earned
            answer.grader = admin
            answer.graded_at = Time.zone.now
            answer.save!
          end

          submission.mark!
          submission.save!
          submission.publish!
          submission.save!
        end

        print '.'
      end

      puts "\nCreated #{student_profiles.size} students with submissions."
      puts "\nDone! Log in as test@example.org and visit:"
      puts "  http://localhost:3000/courses/#{course.id}/gradebook"
    end
  end
end
