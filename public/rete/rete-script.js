"use strict";
/*global
    $
    Rete
    ConnectionPlugin
    VueRenderPlugin    
    ContextMenuPlugin
    AreaPlugin
    CommentPlugin
    HistoryPlugin
    ConnectionMasteryPlugin
*/

const nodered_url_prefix = "/";
// this script assumes it is in a folder named "rete"

var numSocket = new Rete.Socket('Number value');
window.manifest = {};

var VueNumControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="number" class="livetype" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {return {  value: 0  }; },
  methods: {
    change(e){
      this.value = +e.target.value;
      this.update();
    },
    update() {
      if (this.ikey){
        this.putData(this.ikey, this.value);
      }
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = 0; //default input-able items to 0
    this.emitter.trigger('process');
  }
};

var VueTextControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="text" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {return {  value: ""  }; },
  methods: {
    change(e){
      this.value = e.target.value;
      this.update();
    },
    update() {
      if (this.ikey) this.putData(this.ikey, this.value);
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = this.getData(this.ikey);
  }
};

var VueScanIDControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  //template: '<input class="scanID" type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  template: '<div style="height:20px;"><label>Phase:</label><input class="scanID" type="number" :readonly="readonly" :value="value" min="0" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/></div>',
  data() {return {  value: 0  }; },
  methods: {
    change(e){
      this.value = Math.max(+e.target.value,0);
      // without min="0", the above is not sufficient to prevent the textbox to below 0
      // however it does clamp the actual data value sufficiently
      this.update();
    },
    update() {
      if (this.ikey)
        this.putData(this.ikey, this.value);
      //this.data.value = this.value
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = 0;
  }
};

var VueNodeIDControl = {
  props: ['nodeID'],
  //template: '<input class="scanID" type="number" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  template: '<div style="" :data-nodeID="nodeID"><!--button v-on:click="addNodeInput">+</button--></div>',
  data() {},
  methods: {
    addNodeInput(){
      //can not seem to get this to work.
      // as is it will add it but only if you click twice
      //console.log("add Input");
      //console.log(this);
      // THIS IS NOT USED - WIP!!
      var foo = editor.nodes.find(n => n.id == this.nodeID).addInput(new Rete.Input('in3', "In3", numSocket));
      //console.log(foo);
      setTimeout(function(){editor.events.rendercontrol[0](foo.vueContext.$el, foo)},1000);
      this.emitter.trigger('process');
    }
  },
  mounted() {}
};


class NumControl extends Rete.Control {
  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly };
    //this.data = {value:0};
    //this.setValue(0);
  }
  setValue(val) {
    this.vueContext.value = val;
  }
}

class TextControl extends Rete.Control {
  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueTextControl;
    this.props = { emitter, ikey: key, readonly };
  }
  setValue(val) {
    this.vueContext.value = val;
  }
}

class ScanIDControl extends Rete.Control {
  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueScanIDControl;
    this.props = { emitter, ikey: key, readonly };
  }
  setValue(val) {
    this.vueContext.value = val;
  }
}

class NodeIDControl extends Rete.Control {
  constructor(key, nodeID) {
    super(key);
    this.component = VueNodeIDControl;
    this.props = { ikey: key, nodeID };
  }
}


var VueBoolControl = {
  props: ['readonly', 'emitter', 'ikey', 'getData', 'putData'],
  template: '<input type="number" v-bind:class="{true: value, false: !value, boolean: 1, livetype: 1}" min="0" :readonly="readonly" :value="value" @input="change($event)" @dblclick.stop="" @pointerdown.stop="" @pointermove.stop=""/>',
  data() {return {  value: 0  }; },
  methods: {
    change(e){
      this.value = +e.target.value;
      this.update();
    },
    update() {
      this.value = this.value<0?0:!!(this.value)*1;
      if (this.ikey)
        this.putData(this.ikey, this.value);
      this.emitter.trigger('process');
    }
  },
  mounted() {
    this.value = 0; //default all items to 0
    this.emitter.trigger('process');
  }
};

class BoolControl extends Rete.Control {
  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueBoolControl;
    this.props = { emitter, ikey: key, readonly };
  }
  setValue(val) {
    this.vueContext.value = !!(val)*1;
  }
}


/* removing as it seems redundant for my purposes
class NumComponent extends Rete.Component {
    constructor(){ super("NUMBER");  }
    builder(node) {
        var out1 = new Rete.Output('out', "Number", numSocket);
        console.log(node);
        return node
              .addControl(new NumControl(this.editor, 'out'))
              .addOutput(out1)
              //.addControl(new ScanIDLabel(this.editor, '#'))
              //.addControl(new ScanIDControl(this.editor, 'scanID'))
              .addControl(new NodeIDControl('nodeID',node.id));
    }
    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
    }
}
*/
class InputComponent extends Rete.Component {
    constructor(){
      super("INPUT");
    }
    builder(node) {
        var out1 = new Rete.Output('out', "Out", numSocket);
        //node.data.value = 0;
        return node
              .addControl(new TextControl(this.editor, 'key'))
              .addControl(new NumControl(this.editor, 'out', true))
              .addOutput(out1)
              .addControl(new NodeIDControl('nodeID',node.id));
    }
    worker(node, inputs, outputs) {
        var value = node.data.value;
        outputs['out'] = value;
    }
}

class OutputComponent extends Rete.Component {
    constructor(){
      super("OUTPUT");
    }
    builder(node) {
        var inp1 = new Rete.Input('in1', "In", numSocket);
        //node.data.value = 0;
        return node
              .addControl(new TextControl(this.editor, 'key'))
              .addControl(new NumControl(this.editor, 'out', true))
              .addInput(inp1)
              .addControl(new NodeIDControl('nodeID',node.id));
    }
    worker(node, inputs, outputs) {
        var value = node.data.value;
        outputs['in1'] = value;
    }
}


class NumberComponent extends Rete.Component{
    builder(node) {
        var inp1 = new Rete.Input('in1',"In1", numSocket);
        var inp2 = new Rete.Input('in2', "In2", numSocket);
        var out = new Rete.Output('out', "Out", numSocket);
        inp1.addControl(new NumControl(this.editor, 'in1'));
        inp2.addControl(new NumControl(this.editor, 'in2'));

        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(new NumControl(this.editor, 'out', true))
            .addControl(new ScanIDControl(this.editor, 'scanID'))
            .addOutput(out)
            .addControl(new NodeIDControl('nodeID',node.id));
    }
    worker(node, inputs, outputs) {
        //var n1 = inputs['in1'].length?inputs['in1'][0]:node.data.num1;
        //var n2 = inputs['in2'].length?inputs['in2'][0]:node.data.num2;
        //this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(output);
        //outputs['out'] = output;
    }
}

//////////////////////////////////////////////////////////////////////////////

class BoolComponent extends Rete.Component {
    builder(node) {
        var inp1 = new Rete.Input('in1', this.labels[0], numSocket);
        var inp2 = new Rete.Input('in2', this.labels[1], numSocket);
        //var inp2 = new BoolControl('in2', this.labels[1], numSocket);
        var out1 = new Rete.Output('out', "Out", numSocket);
        this.data.out = 0;
        inp1.addControl(new BoolControl(this.editor, 'in1'));
        inp2.addControl(new BoolControl(this.editor, 'in2'));
        
        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(new NumControl(this.editor, 'out', true))
            .addControl(new ScanIDControl(this.editor, 'scanID'))
            .addOutput(out1)
            .addControl(new NodeIDControl('nodeID',node.id));
    }
    worker(node, inputs, outputs) {
        //var n1 = inputs['in1'].length?inputs['in1'][0]:node.data.in1;
        //var n2 = inputs['in2'].length?inputs['in2'][0]:node.data.in2;
        //this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(output);
    }
}

class TimerComponent extends Rete.Component {
  // going to use same format as bools, just need an input and reset
    builder(node) {
      var inp1 = new Rete.Input('in1', this.labels[0], numSocket);
      //var inp2 = new Rete.Input('in2', this.labels[1], numSocket);
      //var inp2 = new BoolControl('in2', this.labels[1], numSocket);
      var out1 = new Rete.Output('out', "Out", numSocket);
      this.data.out = 0;
      //inp1.addControl(new BoolControl(this.editor, 'in1'));
      //inp2.addControl(new BoolControl(this.editor, 'in2'));
      
      return node
          .addInput(inp1)
          //.addInput(inp2)
          .addControl(new NumControl(this.editor, 'out', true))
          .addControl(new ScanIDControl(this.editor, 'scanID'))
          .addOutput(out1)
          .addControl(new NodeIDControl('nodeID',node.id));
    }
}

class NotComponent extends Rete.Component {
    constructor(){
      super("NOT");
      this.labels = ["In"];
    }
    builder(node) {
      var inp1 = new Rete.Input('in1', this.labels[0], numSocket);
      //var inp2 = new Rete.Input('in2', this.labels[1], numSocket);
      //var inp2 = new BoolControl('in2', this.labels[1], numSocket);
      var out1 = new Rete.Output('out', "Out", numSocket);
      this.data.out = 0;
      //inp1.addControl(new BoolControl(this.editor, 'in1'));
      //inp2.addControl(new BoolControl(this.editor, 'in2'));
      
      return node
          .addInput(inp1)
          //.addInput(inp2)
          .addControl(new NumControl(this.editor, 'out', true))
          .addControl(new ScanIDControl(this.editor, 'scanID'))
          .addOutput(out1)
          .addControl(new NodeIDControl('nodeID',node.id));
    }
}

class AddComponent extends NumberComponent {
    constructor(){ super("SUM"); }
}

class GTComponent extends NumberComponent {
    constructor(){ super("GT"); }
}


class AndComponent extends BoolComponent {
    constructor(){ 
      super("AND");
      this.labels = ["In1","In2"];
    }
}

class SRComponent extends BoolComponent {
    constructor(){
      super("SR");
      this.labels = ["Set*","Reset"];
    }
}

class RSComponent extends BoolComponent {
    constructor(){
      super("RS");
      this.labels = ["Set","Reset*"];
    }
}

class TONComponent extends TimerComponent{
    constructor(){
      super("TON");
      this.labels = ["Enable"];
    }
}

var engine;
var editor;
(async () => {
    var container = document.querySelector('#workspace');
    var components = [
      //new NumComponent(),
      new AddComponent(),
      new GTComponent(),
      new InputComponent(),
      new OutputComponent(),
      new AndComponent(),
      new NotComponent(),
      new SRComponent(),
      new RSComponent(),
      new TONComponent()
    ];
    
    /*var*/ editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin.default);
    editor.use(VueRenderPlugin.default);    
    editor.use(ContextMenuPlugin.default);
    editor.use(AreaPlugin);
    editor.use(CommentPlugin.default);
    editor.use(HistoryPlugin);
    editor.use(ConnectionMasteryPlugin.default);

    /*var*/ engine = new Rete.Engine('demo@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });
/*---------------------------- creation template:
    var n1 = await components[0].createNode({num: 2});
    var n2 = await components[0].createNode({num: 0});
    var add = await components[1].createNode();

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];
 
    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(add);

    editor.connect(n1.outputs.get('num'), add.inputs.get('num'));
    editor.connect(n2.outputs.get('num'), add.inputs.get('num2'));
*/

    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
      //console.log('process');
        await engine.abort();
        //await engine.process(editor.toJSON());
        //function validateScans(){
        var maxScan = 0;
        editor.nodes.forEach(n => {
          if(n.data.hasOwnProperty("scanID")){
            maxScan = Math.max(maxScan, n.data.scanID);
          }
        });
        editor.nodes.forEach(n => {
          if(!n.data.hasOwnProperty("scanID") && n.controls.get("scanID")){
            //console.log({n});
            n.controls.get("scanID").setValue(maxScan + 1);
            n.data.scanID = maxScan + 1;
          }
        });
        window.manifest = editor.toJSON();
    });

    editor.view.resize();
    AreaPlugin.zoomAt(editor);
    editor.trigger('process');
    
    //-------------------------------------------WEBSOCKET STUFF---------------------------
    // Let us open a web socket
    var url = document.location.toString().replace(/[?#].*$/,"").replace(/https?:\/\//,"ws://").replace(/\/rete\//,"");
    var ws = new WebSocket(url + nodered_url_prefix + "ws/rete");
    
    ws.onopen = function() {
      // Web Socket is connected, send data using send()
      ws.send("NEW_CONNECTION");
      upload();
    };
    
    ws.onmessage = function (evt) { 
      var received_msg = JSON.parse(evt.data);
      //console.log(received_msg);
      //console.log(editor);
      showData(editor, received_msg);
      connectPLC();
    };
    
    ws.onclose = function() { 
      // websocket is closed.
      console.log("Connection is closed..."); 
    };
    
    //--------------------------------------------INTERFACE STUFF------------------
    function download(){
      //console.log(window.manifest);
      var url = document.location.toString().replace(/[?#].*$/,"").replace(/\/rete\//,"");
      url = url + nodered_url_prefix + "rete/download";
      //console.log(window.manifest);
      $.ajax({
        url,
        dataType: 'text',
        type: 'post',
        data: window.manifest,
        success: function( data, textStatus, jQxhr ){
            console.log(data);
        },
        error: function( data, textStatus, jQxhr ){
            console.log({data, textStatus, jQxhr});
        }
      });
    }
    
    function upload(){
      var url = document.location.toString().replace(/[?#].*$/,"").replace(/\/rete\//,"");
      url = url + nodered_url_prefix + "rete/upload";
      $.ajax({
        url,
        dataType: 'json',
        type: 'get',
        success: function( data, textStatus, jQxhr ){
            // the fromJSON function is mega picky about the data structure...
            /// at least, .. I think?? Might be able to remove some of this,
            //console.log(data);
            if (!data.comments) data.comments = [];
            var nodes_transform = {};
            data.nodes.forEach(n => {
              if(!n.inputs){
                n.inputs = {};
              }else{
                Object.keys(n.inputs).forEach(cx => {
                  n.inputs[cx].connections[0].node *= 1;
                  if(!n.inputs[cx].connections[0].data){
                    n.inputs[cx].connections[0].data = {};
                  }
                });
              }
              if(!n.outputs){
                n.outputs = {};
              }else{
                Object.keys(n.outputs).forEach(cx => {
                  n.outputs[cx].connections[0].node *= 1;
                  if(!n.outputs[cx].connections[0].data){
                    n.outputs[cx].connections[0].data = {};
                  }
                });
              }
              if(n.data.hasOwnProperty("scanID")){
                n.data.scanID *= 1;
              }
              for (var i in n.position){
                n.position[i] *= 1;
              }
              n.id *= 1;
              nodes_transform[n.id] = n;
            });
            data.nodes = nodes_transform;
            /// and finally,
            editor.fromJSON(data).then(function(){
              showData(editor, data.nodes);
            });
            //editor.trigger("process");
            //console.log(data);
            editor.view.resize();
            AreaPlugin.zoomAt(editor);
        },
        error: function( data, textStatus, jQxhr ){
            console.log({data, textStatus, jQxhr});
        }
      });
      //editor.fromJSON(manifest);
    }
    
    function connectPLC(){
      $("#workspace").addClass("connected");
    }
    
    function disconnectPLC(){
      $("#workspace").removeClass("connected");
    }
    function runPLC(){
      ws.send("RUN");
    }
    function stopPLC(){
      ws.send("STOP");
      disconnectPLC();
    }
    
    $(document).ready(function(){
        $("#download-button").on("click",download);
        $("#upload-button").on("click",upload);
        $("#connect-button").on("click",connectPLC);
        $("#disconnect-button").on("click",disconnectPLC);
        $("#run-button").on("click",runPLC);
        $("#stop-button").on("click",stopPLC);
    });
    
})();

function showData(editor, data){
  //console.log("showData");
  //console.log(editor);
  editor.nodes.forEach(node => {
    //console.log(node);
    if(data[node.id]){
      //console.log(data[node.id]);
      Object.keys(data[node.id].data).forEach(key => {
        //console.log({node, key});
        //console.log(data[node.id].data[key]);
        node.data[key] = data[node.id].data[key];
        var control;
        if(key == "out"){
          control = node.controls.get("out");
        }else{
          try{
            control = node.controls.get(key) || node.inputs.get(key).control;
          }catch(error){
            //console.log({node, key, error, data });
          }
        }
        //console.log(node.controls);
        //console.log(node);
        if(!!control) control.setValue(node.data[key]);
        node.update();
      });
    }
  });
  editor.trigger("process");
}

if (!("WebSocket" in window)) {
   alert("ERROR: WebSocket not supported by your Browser!");
}