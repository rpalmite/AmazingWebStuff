<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>JavaScript Notepad</title>
</head>
<body>
<script src="../yui/build/yui/yui-debug.js" type="text/javascript"></script>
<script type="text/javascript" src="static/js/wut.js">
<script type="text/javascript">
W = WUT({server:"api.webutilitykit.com", port:"8000"}).post({resource: "hash"},{id:"5", value:"8"}).get({resource: "hash"}, {id:"5"}, function(o) {o.responseText();});
</script>
</body>
</html>