# frozen_string_literal: true
Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'application#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  get '/health_check', to: 'health_check#show'

  concern :conditional do
    namespace :condition do
      resources :achievements, except: [:new, :edit]
      resources :levels, except: [:new, :edit]
      resources :assessments, except: [:new, :edit]
      resources :surveys, except: [:new, :edit]
    end
  end

  devise_scope :user do
    get 'users/edit' => nil
  end

  devise_for :users, controllers: {
    registrations: 'user/registrations',
    sessions: 'user/sessions',
    passwords: 'user/passwords',
    confirmations: 'user/confirmations'
  }

  get 'csrf_token' => 'csrf_token#csrf_token'

  resources :announcements, only: [:index] do
    post 'mark_as_read'
  end

  resources :jobs, only: [:show]

  resources :instance_user_role_requests, path: 'role_requests' do
    patch 'approve', on: :member
    patch 'reject', on: :member
  end

  resources :users, only: [:show]

  namespace :user do
    resources :emails, only: [:index, :create, :destroy] do
      post 'set_primary', on: :member
      post 'send_confirmation', on: :member
    end

    resource :profile, only: [:show, :edit, :update] do
      get 'time_zones'
    end
  end

  scope module: 'system' do
    namespace :admin do
      get '/' => 'admin#index'
      resources :announcements, only: [:index, :create, :update, :destroy]
      resources :instances, only: [:index, :create, :update, :destroy]
      resources :users, only: [:index, :update, :destroy]
      resources :courses, only: [:index, :destroy]

      namespace :instance do
        get '/' => 'admin#index', as: :admin
        resources :announcements, only: [:index, :create, :update, :destroy]
        resources :users, only: [:index, :update, :destroy]
        resources :users do
          get 'invite' => 'user_invitations#new', on: :collection
          post 'invite' => 'user_invitations#create', on: :collection
          post 'resend_invitations' => 'user_invitations#resend_invitations', on: :collection
        end
        resources :user_invitations, only: [:index, :destroy] do
          post 'resend_invitation'
        end
        resources :courses, only: [:index, :destroy]
        get 'components' => 'components#index'
        patch 'components' => 'components#update'
      end
    end
  end

  scope module: 'course' do
    resources :courses, except: [:new, :edit, :update] do
      get 'sidebar', on: :member

      resources :experience_points_records, only: [:index] do
        collection do
          get 'download'
        end
      end

      namespace :admin do
        get '/' => 'admin#index'
        patch '/' => 'admin#update'
        delete '/' => 'admin#destroy'

        get 'time_zones' => 'admin#time_zones'

        get 'components' => 'component_settings#edit'
        patch 'components' => 'component_settings#update'

        get 'items' => 'sidebar_settings#show'
        get 'sidebar' => 'sidebar_settings#edit'
        patch 'sidebar' => 'sidebar_settings#update'

        get 'notifications' => 'notification_settings#edit'
        patch 'notifications' => 'notification_settings#update'

        get 'announcements' => 'announcement_settings#edit'
        patch 'announcements' => 'announcement_settings#update'

        get 'assessments' => 'assessment_settings#edit'
        post 'move_tabs' => 'assessment_settings#move_tabs'
        post 'move_assessments' => 'assessment_settings#move_assessments'
        patch 'assessments' => 'assessment_settings#update'

        get 'codaveri' => 'codaveri_settings#edit'
        get 'codaveri/assessment' => 'codaveri_settings#assessment'
        patch 'codaveri' => 'codaveri_settings#update'
        patch 'codaveri/update_evaluator' => 'codaveri_settings#update_evaluator'
        patch 'codaveri/update_live_feedback_enabled' => 'codaveri_settings#update_live_feedback_enabled'

        get 'materials' => 'material_settings#edit'
        patch 'materials' => 'material_settings#update'

        get 'forums' => 'forum_settings#edit'
        patch 'forums' => 'forum_settings#update'

        get 'leaderboard' => 'leaderboard_settings#edit'
        patch 'leaderboard' => 'leaderboard_settings#update'

        get 'comments' => 'discussion/topic_settings#edit', as: 'topics'
        patch 'comments' => 'discussion/topic_settings#update'

        get 'videos' => 'video_settings#edit'
        patch 'videos' => 'video_settings#update'

        get 'lesson_plan' => 'lesson_plan_settings#edit'
        patch 'lesson_plan' => 'lesson_plan_settings#update'

        get 'stories' => 'stories_settings#edit'
        patch 'stories' => 'stories_settings#update'

        namespace 'assessments' do
          resources :categories, only: [:create, :destroy] do
            resources :tabs, only: [:create, :destroy]
          end
        end

        namespace 'videos' do
          resources :tabs, only: [:create, :destroy]
        end
      end

      resources :announcements, except: [:show, :new, :edit]

      scope module: :achievement do
        resources :achievements, except: [:new, :edit] do
          concerns :conditional
          get :achievement_course_users, on: :member
          post 'reorder', on: :collection
        end
      end

      scope module: :assessment do
        resources :assessments do
          post 'reorder', on: :member
          post 'authenticate', on: :member
          post 'remind', on: :member
          post 'unblock_monitor', on: :member
          put 'sync_with_koditsu', on: :member
          post 'invite_to_koditsu', on: :member
          get :requirements, on: :member
          get :statistics, on: :member
          get :monitoring, on: :member
          get :seb_payload, on: :member

          resources :questions, only: [] do
            post 'duplicate/:destination_assessment_id', on: :member, action: 'duplicate', as: :duplicate
          end

          namespace :question do
            resources :multiple_responses, only: [:new, :create, :edit, :update, :destroy]
            resources :text_responses, only: [:new, :create, :edit, :update, :destroy]
            resources :programming, only: [:new, :create, :edit, :update, :destroy] do
              post :generate, on: :collection
              get :codaveri_languages, on: :collection
              patch :update_question_setting, on: :member
            end
            resources :voice_responses, only: [:new, :create, :edit, :update, :destroy]
            resources :scribing, only: [:show, :new, :create, :edit, :update, :destroy]
            resources :forum_post_responses, only: [:new, :create, :edit, :update, :destroy]
          end

          scope module: :submission do
            get 'attempt' => 'submissions#create'
            resources :submissions, only: [:index, :edit, :update] do
              post :auto_grade, on: :member
              post :reload_answer, on: :member
              post :reevaluate_answer, on: :member
              post :generate_feedback, on: :member
              get :fetch_submitted_feedback, on: :member
              post :generate_live_feedback, on: :member
              post 'save_live_feedback', to: 'live_feedback#save_live_feedback', on: :collection
              get :download_all, on: :collection
              get :download_statistics, on: :collection
              patch :publish_all, on: :collection
              patch :force_submit_all, on: :collection
              patch :fetch_submissions_from_koditsu, on: :collection
              patch :unsubmit, on: :collection
              patch :unsubmit_all, on: :collection
              patch :delete, on: :collection
              patch :delete_all, on: :collection
              resources :logs, only: [:index]
              scope module: :answer do
                resources :answers, only: [:update] do
                  patch :submit_answer, on: :member
                  namespace :text_response do
                    post 'create_files' => 'text_response#create_files'
                    patch 'delete_file' => 'text_response#delete_file'
                  end
                  namespace :programming do
                    post 'create_programming_files' => 'programming#create_programming_files'
                    post 'destroy_programming_file' => 'programming#destroy_programming_file'
                    resources :files, only: [] do
                      resources :annotations, only: [:create]
                    end
                  end
                  namespace :scribing do
                    resources :scribbles, only: [:create]
                  end
                  namespace :forum_post_response do
                    get 'selected_post_packs' => 'posts#selected'
                  end
                end
              end
            end
          end

          scope module: :submission_question do
            resources :submission_questions, only: [] do
              get :past_answers, on: :member
              resources :comments, only: [:create]
            end
          end

          concerns :conditional

          collection do
            resources :skills, as: :assessments_skills, except: [:show, :new, :edit] do
              get 'options', on: :collection
            end
            resources :skill_branches, as: :assessments_skill_branches, except: [:index, :show, :new, :edit]
            resources :submissions, only: [:index] do
              get 'pending', on: :collection
            end
          end

          resources :sessions, only: [:new, :create]

          # Randomized Assessment is temporarily hidden (PR#5406)
          # resources :question_groups, except: :show
          # resources :question_bundles, except: :show
          # resources :question_bundle_questions, except: :show
          # resources :question_bundle_assignments, except: [:show, :new] do
          #   post 'recompute', on: :collection
          # end
        end
        resources :categories, only: [:index]
      end
      resources :levels, only: [:index, :create]
      resource :duplication, only: [:show, :create]
      resource :object_duplication, only: [:new, :create]

      resources :user_invitations, only: [:index, :new, :create, :destroy] do
        post 'resend_invitation'
      end

      resources :enrol_requests, only: [:index, :create, :destroy] do
        patch 'approve', on: :member
        patch 'reject', on: :member
      end

      namespace :lesson_plan do
        get '/' => 'items#index'
        get 'edit' => 'items#index'
        resources :milestones, only: [:create, :update, :destroy]
        resources :items, only: [:update]
        resources :events, only: [:create, :update, :destroy]
        resources :todos, only: [] do
          post 'ignore', on: :member
        end
      end

      scope module: :forum do
        resources :forums, except: [:new, :edit] do
          resources :topics, except: [:new, :edit] do
            resources :posts, only: [:create, :update, :destroy] do
              put 'vote', on: :member
              put 'toggle_answer', on: :member
            end

            post 'subscribe', on: :member
            delete 'subscribe', on: :member
            patch 'locked' => 'topics#set_locked', on: :member
            patch 'hidden' => 'topics#set_hidden', on: :member
          end

          post 'subscribe', on: :member
          delete 'unsubscribe', on: :member

          get 'all_posts', on: :collection
          get 'search', on: :collection
          patch 'mark_all_as_read', on: :collection
          patch 'mark_as_read', on: :member
        end
      end

      resources :users, only: [:index, :show, :update, :destroy] do
        resources :experience_points_records, only: [:update, :destroy] do
          get '/' => 'experience_points_records#show', on: :collection
        end
        resources :video_submissions, only: [:index]
        resources :personal_times, only: [:index, :create, :destroy]
        get 'personal_times' => 'personal_times#index', on: :collection
        post 'personal_times/recompute' => 'personal_times#recompute'

        get 'invite' => 'user_invitations#new', on: :collection
        post 'invite' => 'user_invitations#create', on: :collection
        post 'resend_invitations' => 'user_invitations#resend_invitations', on: :collection
        post 'toggle_registration' => 'user_invitations#toggle_registration', on: :collection
        get 'disburse_experience_points' => 'experience_points/disbursement#new', on: :collection
        post 'disburse_experience_points' => 'experience_points/disbursement#create',
             on: :collection
        get 'forum_disbursement' => 'experience_points/forum_disbursement#new', on: :collection
        post 'forum_disbursement' => 'experience_points/forum_disbursement#create',
             on: :collection
        get 'manage_email_subscription' => 'user_email_subscriptions#edit'
        patch 'manage_email_subscription' => 'user_email_subscriptions#update'

        patch 'assign_timeline', on: :collection
      end
      post 'register' => 'user_registrations#create'
      get 'students' => 'users#students', as: :users_students
      get 'staff' => 'users#staff', as: :users_staff
      patch 'upgrade_to_staff' => 'users#upgrade_to_staff', as: :users_upgrade_to_staff

      scope module: :group do
        resources :group_categories, path: 'groups', except: [:new, :edit] do
          member do
            get 'info' => 'group_categories#show_info'
            get 'users' => 'group_categories#show_users'
            post 'groups' => 'group_categories#create_groups'
            patch 'group_members' => 'group_categories#update_group_members'
          end

          resources :groups, only: [:update, :destroy]
        end
      end

      namespace :material, path: 'materials' do
        resources :folders, except: [:new, :create] do
          post 'create/subfolder', on: :member, as: 'create_subfolder', action: 'create_subfolder'
          put 'upload_materials', on: :member
          get 'download', on: :member
          resources :materials, path: 'files' do
            put 'create_text_chunks', on: :member
            delete 'destroy_text_chunks', on: :member
          end
        end
      end

      resource :leaderboard, only: [:index] do
        get '/' => 'leaderboards#index'
        get 'groups', as: :group
      end

      scope module: :discussion do
        resources :topics, path: 'comments', only: [:index] do
          get 'pending', on: :collection
          get 'my_students', on: :collection
          get 'my_students_pending', on: :collection
          get 'all', on: :collection
          patch 'toggle_pending', on: :member
          patch 'mark_as_read', on: :member
          resources :posts, only: [:create, :update, :destroy]
        end
      end

      namespace :statistics do
        get '/' => 'statistics#index'
        get 'answer/:id' => 'answers#question_answer_details'
        get 'assessments' => 'aggregate#all_assessments'
        get 'assessments/download' => 'aggregate#download_score_summary'
        get 'students' => 'aggregate#all_students'
        get 'staff' => 'aggregate#all_staff'
        get 'course/progression' => 'aggregate#course_progression'
        get 'course/performance' => 'aggregate#course_performance'
        get 'submission_question/:id' => 'answers#all_answers'
        get 'user/:user_id/learning_rate_records' => 'users#learning_rate_records'
        get 'assessment/:id/main_statistics' => 'assessments#main_statistics'
        get 'assessment/:id/ancestor_statistics' => 'assessments#ancestor_statistics'
        get 'assessment/:id/live_feedback_statistics' => 'assessments#live_feedback_statistics'
        get 'assessment/:id/live_feedback_history' => 'assessments#live_feedback_history'
      end

      scope module: :video do
        resources :videos, except: [:new, :edit] do
          resources :topics, only: [:index, :create, :show]
          scope module: :submission do
            get 'attempt' => 'submissions#create'
            resources :submissions, only: [:index, :create, :show, :edit] do
              resources :sessions, only: [:create, :update]
            end
          end
        end
      end

      scope module: :survey do
        resources :surveys, only: [:index, :create, :show, :update, :destroy] do
          get 'results', on: :member
          get 'download', on: :member
          post 'remind', on: :member
          post 'reorder_questions', on: :member
          post 'reorder_sections', on: :member
          resources :questions, only: [:create, :update, :destroy]
          resources :responses, only: [:index, :create, :show, :edit, :update] do
            post 'unsubmit', on: :member
          end
          resources :sections, only: [:create, :update, :destroy]
        end
      end

      resources :user_notifications do
        get 'fetch', on: :collection
        post 'mark_as_read', on: :member
      end

      resource :learning_map, only: [:index] do
        get '/' => 'learning_map#index'
        post 'add_parent_node' => 'learning_map#add_parent_node'
        post 'remove_parent_node' => 'learning_map#remove_parent_node'
        post 'toggle_satisfiability_type' => 'learning_map#toggle_satisfiability_type'
      end

      resources :reference_timelines, path: 'timelines', except: [:new, :edit, :show] do
        resources :reference_times, path: 'times', only: [:create, :update, :destroy]
      end

      scope module: :stories do
        get 'learn', to: 'stories#learn'
        get 'mission_control', to: 'stories#mission_control'
      end
    end
  end

  resources :attachment_references, path: 'attachments', only: [:create, :show]

  if Rails.env.test?
    namespace :test do
      post 'create' => 'factories#create'
      delete 'clear_emails' => 'mailer#clear'
      get 'last_sent_email' => 'mailer#last_sent'
    end
  end
end
