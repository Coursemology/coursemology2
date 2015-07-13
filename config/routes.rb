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
    end
  end

  devise_for :users, controllers: {
    registrations: 'user/registrations',
    sessions: 'user/sessions'
  }

  resources :announcements, only: [:index]
  namespace :user do
    resources :emails, only: [:index, :create, :destroy]
  end

  scope module: 'system' do
    namespace :admin do
      get '/' => 'admin#index'
      resources :announcements, except: [:show], concerns: :paginatable
      resources :instance_announcements, except: [:show], concerns: :paginatable
      resources :instances, except: [:show]

      get 'components' => 'admin#components'
      patch 'components' => 'admin#update_components'
    end
  end

  scope module: 'course' do
    resources :courses, except: [:edit, :update] do
      namespace :admin do
        get '/' => 'admin#index'
        patch '/' => 'admin#update'

        get 'components' => 'component_settings#edit'
        patch 'components' => 'component_settings#update'
        get 'sidebar' => 'sidebar_settings#edit'
        patch 'sidebar' => 'sidebar_settings#update'
        get 'announcements' => 'announcement_settings#edit'
        patch 'announcements' => 'announcement_settings#update'
      end

      resources :announcements, concerns: :paginatable
      resources :achievements do
        scope module: :achievement do
          concerns :conditional
        end
      end
      resources :levels, except: [:show, :edit, :update]

      get 'lesson_plan' => 'lesson_plan_items#index'
      resources :lesson_plan_milestones, except: [:index, :show]
      resources :events, except: [:index, :show]

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
    end
  end
end
