# Since we are using AngularJS, the '{}' attribute delimiter should be removed
Slim::Engine.set_default_options :attr_list_delims => {'(' => ')', '[' => ']'}