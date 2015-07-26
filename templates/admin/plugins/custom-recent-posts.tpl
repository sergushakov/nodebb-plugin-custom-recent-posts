<div class="col-lg-9">	
	<div class="panel panel-default">
		<div class="panel-heading">Custom previews count</div>
		<div class="panel-body">
			<form>
        <div class="control-group">
          <label>Previews Count
					  <input class="form-control" id="previewsCount" type="number" data-field="previewsCount" />
				  </label>
        </div>
			</form>
		</div>
	</div>
</div>

<div class="col-lg-3 acp-sidebar">
	<div class="panel panel-default">
		<div class="panel-heading">Save Settings</div>
		<div class="panel-body">
			<button class="btn btn-primary btn-md" id="save">Save Changes</button>
			<button class="btn btn-warning btn-md" id="revert">Revert Changes</button>
		</div>
	</div>
</div>

<script>
 require(['admin/settings'], function(Settings) {
		Settings.prepare();
	});
 </script>
