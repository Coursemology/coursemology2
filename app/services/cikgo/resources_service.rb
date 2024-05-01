# frozen_string_literal: true
class Cikgo::ResourcesService < Cikgo::Service
  class << self
    def ping(push_key)
      response = connection(:get, 'repositories', query: { pushKey: push_key })
      { status: :ok, **response }
    rescue StandardError
      { status: :error }
    end

    def push_repository(course, url, resources)
      connection(:post, 'repositories', body: {
        pushKeys: [push_key(course)],
        repository: {
          id: repository_id(course.id),
          name: course.title,
          sourceUrl: url,
          resources: resources
        }
      })
    end

    def push_resources(course, resources)
      connection(:patch, 'repositories', body: {
        pushKeys: [push_key(course)],
        repository: { id: repository_id(course.id), resources: resources }
      })
    end

    def mark_task(status, lesson_plan_item, data)
      connection(:patch, 'tasks', body: {
        resourceId: lesson_plan_item.id.to_s,
        repositoryId: repository_id(lesson_plan_item.course_id),
        status: status,
        provider: 'coursemology',
        userId: data[:user_id].to_s,
        url: data[:url]
      }.compact)
    end

    private

    def repository_id(course_id)
      "coursemology##{course_id}"
    end
  end
end
