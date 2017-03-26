json.status 'completed'
json.redirect_url @job.redirect_to
json.message t('.completed')
