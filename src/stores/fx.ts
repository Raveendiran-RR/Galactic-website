// Mutable, non-reactive effect state read every frame by the 3D scene and
// written by GSAP timelines. Kept outside React/zustand so animating it never
// triggers a re-render.
export const fx = {
  /** 0..1 hyperspace streak speed */
  speed: 0,
  /** 0..1 camera shake amplitude */
  shake: 0,
  /** distance travelled through the tunnel (drives star wrapping) */
  dist: 0,
  /** field-of-view override added to the base FOV */
  fovBoost: 0,
  /** 0..1 intro star visibility */
  stars: 0,
  /** 0..1 galaxy reveal after hyperspace */
  reveal: 0,
  /** 0..1 chromatic/bloom boost during hyperspace */
  warp: 0,
  /** 0..1 white flash overlay at the hyperspace jump */
  flash: 0,
}

export const resetFx = () => {
  fx.speed = 0
  fx.shake = 0
  fx.dist = 0
  fx.fovBoost = 0
  fx.stars = 0
  fx.reveal = 0
  fx.warp = 0
  fx.flash = 0
}
