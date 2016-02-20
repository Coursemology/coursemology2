# frozen_string_literal: true
Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

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
  concern :paginatable do
    get '(page/:page)', action: :index, on: :collection, as: ''
  end

  concern :conditional do
    namespace :condition do
      resources :achievements, except: [:index]
      resources :levels, except: [:index]
      resources :assessments, except: [:index]
    end
  end

  devise_for :users, controllers: {
    registrations: 'user/registrations',
    sessions: 'user/sessions',
    omniauth_callbacks: 'user/omniauth_callbacks',
    masquerades: 'user/masquerades'
  }

  resources :announcements, only: [:index]
  resources :jobs, only: [:show]

  namespace :user do
    resources :emails, only: [:index, :create, :destroy] do
      post 'set_primary', on: :member
      post 'send_confirmation', on: :member
    end
    resource :profile, only: [:edit, :update]
  end

  scope module: 'system' do
    namespace :admin do
      get '/' => 'admin#index'
      resources :announcements, except: [:show], concerns: :paginatable
      resources :instances, except: [:show]
      resources :users, only: [:index, :update, :destroy], concerns: :paginatable
      resources :courses, only: [:index, :destroy], concerns: :paginatable

      namespace :instance do
        get '/' => 'admin#index', as: :admin
        resources :announcements, except: [:show], concerns: :paginatable
        resources :users, only: [:index, :update, :destroy], concerns: :paginatable
        resources :courses, only: [:index, :destroy], concerns: :paginatable
        get 'components' => 'components#edit'
        patch 'components' => 'components#update'
      end
    end
  end

  scope module: 'course' do
    resources :courses, except: [:edit, :update] do
      namespace :admin do
        get '/' => 'admin#index'
        patch '/' => 'admin#update'
        delete '/' => 'admin#destroy'

        get 'components' => 'component_settings#edit'
        patch 'components' => 'component_settings#update'
        get 'sidebar' => 'sidebar_settings#edit'
        patch 'sidebar' => 'sidebar_settings#update'
        get 'announcements' => 'announcement_settings#edit'
        patch 'announcements' => 'announcement_settings#update'

        get 'assessments' => 'assessment_settings#edit'
        patch 'assessments' => 'assessment_settings#update'

        get 'materials' => 'material_settings#edit'
        patch 'materials' => 'material_settings#update'

        get 'forums' => 'forum_settings#edit'
        patch 'forums' => 'forum_settings#update'
        namespace 'assessments' do
          resources :categories, only: [:new, :create, :destroy] do
            resources :tabs, only: [:new, :create, :destroy]
          end
        end
      end

      resources :announcements, concerns: :paginatable
      resources :achievements do
        scope module: :achievement do
          concerns :conditional
        end
      end

      collection do
        namespace :assessment do
          resources :programming_evaluations, only: [:index, :show], defaults: { format: 'json' } do
            post 'allocate' => 'programming_evaluations#allocate', on: :collection
            get 'package' => 'programming_evaluations#package'
            put 'result' => 'programming_evaluations#update_result'
          end
        end
      end

      scope module: :assessment do
        resources :assessments do
          namespace :question do
            resources :multiple_responses, only: [:new, :create, :edit, :update, :destroy]
            resources :text_responses, only: [:new, :create, :edit, :update, :destroy]
            resources :programming, only: [:new, :create, :edit, :update, :destroy]
          end
          resources :submissions, only: [:create, :edit, :update] do
            post :auto_grade, on: :member
          end
          concerns :conditional

          collection do
            resources :skills, as: :assessments_skills
          end
        end
      end
      resources :levels, except: [:show, :edit, :update]

      namespace :lesson_plan do
        get '/' => 'items#index'
        resources :milestones, except: [:index, :show]
        resources :events, except: [:index, :show]
      end

      scope module: :forum do
        resources :forums do
          resources :topics do
            resources :posts, only: [:create, :edit, :update, :destroy] do
              get 'reply', on: :member
            end

            post 'subscribe', on: :member
            delete 'subscribe', on: :member
            put 'locked' => 'topics#set_locked', on: :member
            put 'hidden' => 'topics#set_hidden', on: :member
          end

          post 'subscribe', on: :member
          delete 'unsubscribe', on: :member
        end
      end

      resources :users, only: [:update, :destroy] do
        get 'invite' => 'user_invitations#new', on: :collection
        post 'invite' => 'user_invitations#create', on: :collection
      end
      post 'register' => 'user_registrations#create'
      get 'students' => 'users#students', as: :users_students
      get 'staff' => 'users#staff', as: :users_staff
      get 'requests' => 'users#requests', as: :users_requests
      get 'invitations' => 'users#invitations', as: :users_invitations

      resources :groups, except: [:show]

      namespace :material, path: 'materials' do
        resources :folders, except: [:index, :new, :create] do
          get 'new_subfolder', on: :member, path: 'new/subfolder'
          post 'create_subfolder', on: :member, path: 'create/subfolder'
          get 'new_materials', on: :member, path: 'new/files'
          put 'upload_materials', on: :member
          get 'download', on: :member
          resources :materials, path: 'files'
        end
      end
    end
  end
end
