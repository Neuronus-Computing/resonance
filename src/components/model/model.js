import React from 'react';
import { Button, Card, CardBody, Container, Row } from 'reactstrap';

const Modal = ({ title, paragraphs, buttonText, onButtonClick }) => (
  <Container fluid={true}>
    <Row>
      <div className="terms-and-conditions">
        <div className="terms-cls">
          <Card className="term-points">
            <CardBody>
              <div className="conditions">
                <h3>{title}</h3>
                {paragraphs.map((text, index) => (
                  <p key={index}>{text}</p>
                ))}
                <div className="understand-btn">
                  <Button className="btn cryto-btn" onClick={onButtonClick}>
                    {buttonText}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Row>
  </Container>
);

export default Modal;
