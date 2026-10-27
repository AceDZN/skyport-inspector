"""Original Rift Runner hard-surface module; Blender source, no external assets."""
import bpy, math, pathlib
from mathutils import Vector
ROOT=pathlib.Path('/Users/acedzn/dev/AceDZN-exp/skyport-inspector')
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
materials={}
def material(name,color,metal=0,rough=.45):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;materials[name]=m;return m
ceramic=material('warm ceramic shell',(.68,.72,.69),.18,.38)
graphite=material('graphite impact ribs',(.055,.07,.08),.45,.47)
aluminum=material('brushed aluminum',(.43,.48,.5),.82,.32)
rubber=material('recessed rubber grip',(.022,.03,.034),.04,.8)
amber=material('restrained amber latch',(.65,.31,.065),.3,.4)
meshes=[]
def box(name,loc,scale,mat,bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(mat)
 if bevel:
  b=o.modifiers.new('machined radius','BEVEL');b.width=bevel;b.segments=3;b.affect='EDGES';bpy.ops.object.modifier_apply(modifier=b.name)
 n=o.modifiers.new('weighted face normals','WEIGHTED_NORMAL');n.keep_sharp=True;n.weight=50;bpy.ops.object.modifier_apply(modifier=n.name)
 meshes.append(o);return o
def bolt(loc,axis='Y'):
 bpy.ops.mesh.primitive_cylinder_add(vertices=10,radius=.025,depth=.016,location=loc);o=bpy.context.object;o.name='inset hex fastener';o.data.materials.append(aluminum)
 if axis=='Y':o.rotation_euler[0]=math.pi/2
 elif axis=='X':o.rotation_euler[1]=math.pi/2
 b=o.modifiers.new('fastener edge','BEVEL');b.width=.003;b.segments=2;bpy.ops.object.modifier_apply(modifier=b.name);meshes.append(o)
box('main rounded ceramic hull',(0,0,.47),(.94,.84,.86),ceramic,.07)
# Four graphite corner pillars, protective top/bottom rims with deliberate edge gaps.
for x in [-.43,.43]:
 for y in [-.38,.38]:box('corner bumper',(x,y,.47),(.15,.15,.94),graphite,.035)
for z in [.055,.885]:
 for y in [-.38,.38]:box('rim beam',(0,y,z),(.8,.15,.11),graphite,.022)
 for x in [-.43,.43]:box('side rim beam',(x,0,z),(.15,.68,.11),graphite,.022)
# Front/back panel recess, handle frame around an actual dark indentation.
for sy in [-1,1]:
 y=sy*.432
 box('recess backing',(0,y,.51),(.65,.025,.49),graphite,.045)
 box('panel face',(0,y+sy*.017,.36),(.54,.035,.18),ceramic,.025)
 box('handle void',(0,y+sy*.024,.62),(.42,.014,.15),rubber,.025)
 box('handle upper rail',(0,y+sy*.06,.72),(.5,.085,.065),aluminum,.018)
 for x in [-.225,.225]:box('handle side return',(x,y+sy*.055,.64),(.065,.075,.17),aluminum,.018)
 box('rubber handle grip',(0,y+sy*.074,.72),(.28,.075,.06),rubber,.018)
 box('latch mount',(0,y+sy*.043,.36),(.16,.035,.13),aluminum,.013)
 box('safety latch',(0,y+sy*.068,.36),(.09,.025,.09),amber,.01)
 for x in [-.34,.34]:
  for z in [.24,.77]:bolt((x,y+sy*.025,z))
 # Narrow original inlaid registration stripes, no language-bearing texture.
 for x in [-.27,.27]:box('panel stripe',(x,y+sy*.038,.36),(.025,.012,.12),graphite,.004)
# Side inset plates and recessed grips.
for sx in [-1,1]:
 x=sx*.477
 box('side inset',(x,0,.49),(.022,.53,.5),graphite,.032)
 box('side ceramic plate',(x+sx*.015,0,.46),(.025,.41,.37),ceramic,.026)
 box('side handle recess',(x+sx*.03,0,.55),(.018,.26,.075),rubber,.018)
 for y in [-.26,.26]:
  for z in [.27,.72]:bolt((x+sx*.02,y,z),'X')
# Raised top service hatch, neutral neutral indicator, heat slots.
box('top hatch',(0,0,.915),(.61,.56,.045),aluminum,.028)
box('top inset',(0,0,.945),(.49,.42,.025),graphite,.02)
for i in range(5):box('cooling slot',(-.15+i*.075,0,.962),(.025,.26,.012),rubber,.006)
# Join all meshes into one reusable local hero prop, all detail remains real geometry.
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();cargo=bpy.context.object;cargo.name='Rift original cargo module'
bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
# Bottom y-up after glTF conversion: align Blender z-min to0.
bottom=min((cargo.matrix_world@Vector(c)).z for c in cargo.bound_box);cargo.location.z-=bottom
bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/cargo-module.glb'),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_materials='EXPORT')
# Proof render: isolated asset, not gameplay evidence.
world=bpy.data.worlds.new('studio') if not bpy.data.worlds else bpy.data.worlds[0];bpy.context.scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.16,.20,.23,1);world.node_tree.nodes['Background'].inputs[1].default_value=.5
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.006));ground=bpy.context.object;ground.data.materials.append(material('proof ground',(.22,.26,.29),0,.7))
def area(loc,power,size):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.45))-o.location).to_track_quat('-Z','Y').to_euler()
area((2,-3,4),450,3);area((-3,-1,2),260,2);area((0,3,3),500,2)
bpy.ops.object.camera_add(location=(1.8,-2.6,1.8));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.45))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=1.9;bpy.context.scene.camera=cam
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=40;s.cycles.use_denoising=True;s.render.resolution_x=1000;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.filepath=str(ROOT/'docs/rift-art/cargo-module-proof.png');s.view_settings.view_transform='AgX';bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'docs/rift-art/cargo-module.blend'));bpy.ops.render.render(write_still=True)
