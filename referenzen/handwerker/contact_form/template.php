<?php
ob_start();
?>
<html>
	<head>
	</head>
	<body>
		<div><b>Name</b>: <?php echo $values["name"]; ?></div>
		<div><b>E-mail</b>: <?php echo $values["email"]; ?></div>
		<?php if($values["phone"]!=""):?>
		<div><b>Phone</b>: <?php echo $values["phone"]; ?></div>
		<?php endif; ?>
		<div><b>Message</b>: <?php echo nl2br($values["message"]); ?></div>
		<?php if($values["type"]!=""):?>
		<div><b>Type</b>: <?php echo $values["type"]; ?></div>
		<?php endif;
		if($values["square-feet"]!=""):?>
		<div><b>Square Feets</b>: <?php echo $values["square-feet"]; ?></div>
		<?php endif;
		if($values["walls-name"]!=""):?>
		<div><b>Walls</b>: <?php echo $values["walls-name"]; ?></div>
		<?php endif;
		if($values["floors-name"]!=""):?>
		<div><b>Floors</b>: <?php echo $values["floors-name"]; ?></div>
		<?php endif;
		if($values["doors"]!=""):?>
		<div><b>Doors</b>: <?php echo $values["doors"]; ?></div>
		<?php endif;
		if($values["windows"]!=""):?>
		<div><b>Windows</b>: <?php echo $values["windows"]; ?></div>
		<?php endif;
		if($values["total-cost"]!=""):?>
		<div><b>Total cost</b>: <?php echo $values["total-cost"]; ?></div>
		<?php endif;
		if($values["length"]!=""):?>
		<div><b>Length</b>: <?php echo $values["length"]; ?></div>
		<?php endif;
		if($values["height"]!=""):?>
		<div><b>Height</b>: <?php echo $values["height"]; ?></div>
		<?php endif;
		if($values["panel-name"]!=""):?>
		<div><b>Panel Style</b>: <?php echo $values["panel-name"]; ?></div>
		<?php endif;
		if($values["gate-name"]!=""):?>
		<div><b>Gate Type</b>: <?php echo $values["gate-name"]; ?></div>
		<?php endif;
		if($values["extras-name"]!=""):?>
		<div><b>Additional Extras</b>: <?php echo $values["extras-name"]; ?></div>
		<?php endif;
		if($values["area-width"]!=""):?>
		<div><b>Area Width in Meters</b>: <?php echo $values["area-width"]; ?></div>
		<?php endif;
		if($values["area-length"]!=""):?>
		<div><b>Area Length in Meters</b>: <?php echo $values["area-length"]; ?></div>
		<?php endif;
		if($values["block-paving"]!=""):?>
		<div><b>Block Paving</b>: <?php echo $values["block-paving"]; ?></div>
		<?php endif;
		if($values["surface"]!=""):?>
		<div><b>Surface Preparation</b>: <?php echo $values["surface"]; ?></div>
		<?php endif;
		if($values["stone-walling"]!=""):?>
		<div><b>Stone Walling</b>: <?php echo $values["stone-walling"]; ?></div>
		<?php endif; ?>
	</body>
</html>
<?php
$content = ob_get_contents();
ob_end_clean();
return($content);
?>	