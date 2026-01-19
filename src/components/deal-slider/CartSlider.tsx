import React from 'react'
import { Fade } from 'react-awesome-reveal'
import Slider from './slider/Slider'
import { Row } from 'react-bootstrap'

const CartSlider = () => {
  return (
    <section className="section-deal padding-tb-50">
    <div className="container">
        <Row>
            <div className="col-12">
                <Fade triggerOnce direction='up' duration={1000} delay={200} >
                    <div className="section-title bb-center">
                        <div className="section-detail">
                            <h2 className="bb-title">New <span>Arrivals</span></h2>
                            <p>Browse The Collection of Top Products.</p>
                        </div>
                    </div>
                </Fade>
            </div>
            <Slider />
        </Row>
    </div>
</section>
  )
}

export default CartSlider
