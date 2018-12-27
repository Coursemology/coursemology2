# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_session, class: Course::Video::Session.name,
                                 aliases: [:video_session] do
    transient do
      course { build(:course, :with_video_component_enabled) }
      video { build(:video, :published, course: course) }
      student { create(:course_student, course: course) }
    end

    submission do
      build(:video_submission, video: video, creator: student.user, course_user: student)
    end

    creator { student.user }
    updater { creator }

    session_start { Time.zone.now - 5.minutes }
    session_end { Time.zone.now + 5.minutes }

    last_video_time { 0 }

    # Series of watch intervals with pauses after each interval
    # The intervals should be [[0, 20], [39, 70], [10, 25]]
    trait :with_events_paused do
      event_params = [
        { event_type: 'play', video_time: 0 },
        { event_type: 'pause', video_time: 20 },
        { event_type: 'seek_start', video_time: 20 },
        { event_type: 'buffer', video_time: 17 },
        { event_type: 'seek_end', video_time: 39 },
        { event_type: 'play', video_time: 39 },
        { event_type: 'end', video_time: 70 },
        { event_type: 'seek_start', video_time: 70 },
        { event_type: 'buffer', video_time: 67 },
        { event_type: 'seek_end', video_time: 10 },
        { event_type: 'play', video_time: 10 },
        { event_type: 'pause', video_time: 25 }
      ]
      after(:build) do |session|
        session.events << event_params.each_with_index.
                          map { |params, index| build(:video_event, **params, sequence_num: index + 1) }
        session.last_video_time = 25
      end
    end

    # Series of watch intervals without pauses after each interval
    # The intervals should be [[0, 5], [30, 50], [19, 37]]
    trait :with_events_continuous do
      event_params = [
        { event_type: 'play', video_time: 0 },
        { event_type: 'seek_start', video_time: 5 },
        { event_type: 'buffer', video_time: 17 },
        { event_type: 'seek_end', video_time: 30 },
        { event_type: 'play', video_time: 30 },
        { event_type: 'seek_start', video_time: 50 },
        { event_type: 'buffer', video_time: 18 },
        { event_type: 'seek_end', video_time: 19 },
        { event_type: 'play', video_time: 20 },
        { event_type: 'buffer', video_time: 24 },
        { event_type: 'play', video_time: 24 },
        { event_type: 'speed_change', video_time: 30, playback_rate: 1.5 }
      ]
      after(:build) do |session|
        session.events << event_params.each_with_index.
                          map { |params, index| build(:video_event, **params, sequence_num: index + 1) }
        session.last_video_time = 37
      end
    end

    # Series of watch intervals with unclosed start
    # The intervals should be [[0, 30], [39, 45]]
    trait :with_events_unclosed do
      event_params = [
        { event_type: 'play', video_time: 0 },
        { event_type: 'pause', video_time: 30 },
        { event_type: 'seek_start', video_time: 30 },
        { event_type: 'buffer', video_time: 30 },
        { event_type: 'seek_end', video_time: 39 },
        { event_type: 'play', video_time: 39 }
      ]
      after(:build) do |session|
        session.events << event_params.each_with_index.
                          map { |params, index| build(:video_event, **params, sequence_num: index + 1) }
        session.last_video_time = 45
      end
    end

    # Series of watch intervals where user presses play again after video ended
    # then closes window at 4s
    # The intervals should be [[0, 70], [0, 4]]
    trait :with_events_replay do
      event_params = [
        { event_type: 'play', video_time: 0 },
        { event_type: 'end', video_time: 70 },
        { event_type: 'play', video_time: 70 },
        { event_type: 'buffer', video_time: 70 }
      ]
      after(:build) do |session|
        session.events << event_params.each_with_index.
                          map { |params, index| build(:video_event, **params, sequence_num: index + 1) }
        session.last_video_time = 4
      end
    end
  end
end
