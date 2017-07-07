const PRESETS_CONTEXT = require.context('../presets3d', true, /.json$/);
const PRESETS = [];
for (const k of PRESETS_CONTEXT.keys()) {
    PRESETS.push(PRESETS_CONTEXT(k));
}

export default class Scene3D {
    constructor() {
        this.objects = {};
        this.presets = PRESETS;

        this.selectedObj = undefined;
    }
}
