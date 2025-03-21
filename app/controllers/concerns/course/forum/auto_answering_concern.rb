# frozen_string_literal: true
module Course::Forum::AutoAnsweringConcern
  extend ActiveSupport::Concern

  def auto_answer_action(is_new_reply)
    return unless current_course.component_enabled?(Course::RagWiseComponent)

    settings = rag_settings
    # ensures that when manually generating new reply it will always draft
    settings[:response_workflow] = '0' if is_new_reply

    system ||= User.find(User::SYSTEM_USER_ID)
    raise 'No system user. Did you run rake db:seed?' unless system

    target_post = is_new_reply ? @post : @topic.posts.first
    target_post.rag_auto_answer!(@topic, system, nil, settings)
  end

  def publish_post_action
    return false unless current_course.component_enabled?(Course::RagWiseComponent)

    @post.publish!
    publish_post(@post, @topic, current_user, current_course_user)
  end

  def last_rag_auto_answering_job
    return head(:bad_request) unless current_course.component_enabled?(Course::RagWiseComponent)

    job = @post.rag_auto_answering&.job
    (job&.status == 'submitted') ? job : nil
  end

  def rag_settings
    rag_component = current_component_host[:course_rag_wise_component]&.settings
    {
      response_workflow: rag_component&.response_workflow,
      roleplay: rag_component&.roleplay
    }
  end

  def publish_post(post, topic, current_author, current_course_author)
    # In case of conditional publish, when non course-creator publish AI responses
    # The post creator will become the person who pressed the publish button
    post.creator = current_author
    post.updater = current_author

    result = ActiveRecord::Base.transaction do
      raise ActiveRecord::Rollback unless post.save && create_topic_subscription(topic, current_author)
      raise ActiveRecord::Rollback unless topic.update_column(:latest_post_at, post.updated_at)

      true
    end

    send_created_notification(current_author, current_course_author, post) if result
    result
  end

  def create_topic_subscription(topic, current_user)
    if topic.forum.forum_topics_auto_subscribe
      topic.ensure_subscribed_by(current_user)
    else
      true
    end
  end

  def send_created_notification(current_author, current_course_author, post)
    return unless current_author

    Course::Forum::PostNotifier.post_replied(current_author, current_course_author, post)
  end
end
