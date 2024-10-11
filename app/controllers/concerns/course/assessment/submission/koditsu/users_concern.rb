# frozen_string_literal: true
module Course::Assessment::Submission::Koditsu::UsersConcern
  extend ActiveSupport::Concern

  def user_related_hash(user_ids)
    user_hash = User.where(id: user_ids).to_h { |u| [u.id, u] }
    course_user_hash = CourseUser.where(course_id: @assessment.course.id,
                                        user_id: user_ids).to_h do |cu|
      [cu.user_id, cu]
    end

    user_ids.to_h do |uid|
      [uid, [user_hash[uid], course_user_hash[uid]]]
    end
  end

  def course_user_submission_hash(submissions)
    es_hash = email_submission_hash(submissions)
    ecu_hash = email_course_user_hash(es_hash.keys)

    ecu_hash.to_h do |email, user|
      [user, es_hash[email]]
    end
  end

  def email_course_user_hash(emails)
    user_hash = User.
                joins(:emails).
                where(user_emails: { email: emails }).to_h do |user|
      [user.id, user]
    end

    CourseUser.where(course_id: @assessment.course.id,
                     user_id: user_hash.keys).to_h do |cu|
      [user_hash[cu.user_id].email, user_hash[cu.user_id]]
    end
  end

  def email_submission_hash(submissions)
    attempted_submissions = submissions.reject do |submission|
      submission['status'] == 'notStarted' || submission['status'] == 'error'
    end

    attempted_submissions.to_h { |s| [s['user']['email'], s] }
  end
end
