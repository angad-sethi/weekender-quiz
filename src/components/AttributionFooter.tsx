"use client";

import styled from "styled-components";

const Footer = styled.footer`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.5;
`;

const SourceLink = styled.a`
  color: ${({ theme }) => theme.colors.textLight};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function AttributionFooter() {
  return (
    <Footer>
      Questions by Brian Yatman, from <em>The Quiz</em> in{" "}
      <SourceLink
        href="https://www.smh.com.au/good-weekend"
        target="_blank"
        rel="noopener noreferrer"
      >
        Good Weekend
      </SourceLink>{" "}
      (Sydney Morning Herald). Used without affiliation.
    </Footer>
  );
}
